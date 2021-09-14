import handlebars from 'handlebars';
import { JsonRecord } from "fp-ts/Json";
import { RenderError } from "../types/errors";
import { bimap, chainEitherK, right, TaskEither } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { readTextFile } from "../util/ioUtil";
import { tryCatch } from "fp-ts/Either";

export interface TemplateEngine {
  render(context: JsonRecord, templateFileName: string): TaskEither<RenderError, string>
}

export class HandlebarsTemplateEngine implements TemplateEngine {
  private readonly cache: Map<string, HandlebarsTemplateDelegate> = new Map();

  render(context: JsonRecord, templateFileName: string): TaskEither<RenderError, string> {
    return pipe(
      this.getTemplate(templateFileName),
      chainEitherK(template => tryCatch(
        () => template(context),
        e => new RenderError(`Unable to render ${templateFileName} with context ${context}, ${e}`)
      ))
    )
  }

  private getTemplate(templateFileName: string): TaskEither<RenderError, HandlebarsTemplateDelegate> {
    const template = this.cache.get(templateFileName);
    if (template) {
      return right(template)
    }
    return pipe(
      readTextFile(templateFileName),
      bimap(
        e => new RenderError(`Unable to load template from ${templateFileName}, ${e} `),
        source => {
          const temp = handlebars.compile(source);
          this.cache.set(templateFileName, temp);
          return temp;
        }
      )
    );
  }
}

export const templateEngine: TemplateEngine = new HandlebarsTemplateEngine();
