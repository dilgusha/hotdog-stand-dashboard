import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      const message = errors.map(err => Object.values(err.constraints || {})).flat().join(', ');
      return res.status(400).json({ message: `Validation failed: ${message}` });
      return;
    }

    req.body = dto;
    next();
  };
}

export function validateQuery<T>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.query);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      const message = errors.map(err => Object.values(err.constraints || {})).flat().join(', ');
      return res.status(400).json({ message: `Validation failed: ${message}` });
      return;
    }

    req.query = dto;
    next();
  };
}
