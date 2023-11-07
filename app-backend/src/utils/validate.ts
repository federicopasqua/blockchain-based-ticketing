import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export function validateBody<T>(validator: Joi.AnySchema<T>) {
  return function (req: Request<any, T>, res: Response, next: NextFunction) {
    const validated = validator.validate(req.body);

    if (validated.error) {
      return res.status(422).send({
        location: "body",
        key: validated.error.details[0].context?.key,
        error: validated.error.details[0].message,
      });
    }
    req.body = validated.value;
    next();
  };
}

export function validateParams<T>(validator: Joi.AnySchema<T>) {
  return function (
    req: Request<T, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const validated = validator.validate(req.params);
    if (validated.error) {
      return res.status(422).send({
        location: "params",
        key: validated.error.details[0].context?.key,
        error: validated.error.details[0].message,
      });
    }
    req.params = validated.value;
    next();
  };
}

export function validateQuery<T>(validator: Joi.AnySchema<T>) {
  return function (
    req: Request<any, any, any, T>,
    res: Response,
    next: NextFunction
  ) {
    const validated = validator.validate(req.query);

    if (validated.error) {
      return res.status(422).send({
        location: "query",
        key: validated.error.details[0].context?.key,
        error: validated.error.details[0].message,
      });
    }

    req.query = validated.value;
    next();
  };
}
