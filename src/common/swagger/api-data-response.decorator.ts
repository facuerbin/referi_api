import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiDataResponseOptions {
  isArray?: boolean;
  status?: number;
  description?: string;
}

/**
 * Documents the `{ data: ... }` envelope most controllers return.
 *
 * Handlers here write responses manually via `@Res()`, so Nest cannot infer
 * any response type on its own — every shape has to be declared explicitly.
 * This keeps that declaration to one line instead of a wrapper class per model.
 */
export const ApiDataResponse = <TModel extends Type<unknown>>(
  model: TModel,
  options: ApiDataResponseOptions = {},
) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: options.status ?? 200,
      description: options.description,
      schema: {
        properties: {
          data: options.isArray
            ? { type: 'array', items: { $ref: getSchemaPath(model) } }
            : { $ref: getSchemaPath(model) },
        },
      },
    }),
  );

/** Documents the `{ error: string }` shape these controllers return on failure. */
export const ApiErrorResponse = (status: number, description: string) =>
  ApiResponse({
    status,
    description,
    schema: { properties: { error: { type: 'string' } } },
  });
