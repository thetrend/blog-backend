import { NextFunction, Request, Response } from 'express';
import convert from 'url-slug';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category';
import { createCategory, getCategoryByID, getAllCategories, updateCategory } from '../services/categoryService';

export const CreateCategoryHandler = async (
  req: Request<{}, {}, CreateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await createCategory({
      name: req.body.name,
      slug: convert(req.body.name),
      private: req.body.private,
    });
    res.status(201).json({
      data: {
        category,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const ReadAllCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({
      data: {
        categories,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const ReadCategoryHandler = async (
  req: Request<{ id: string; }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await getCategoryByID({ id: parseInt(req.params.id) });
    res.status(200).json({
      data: {
        category,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const UpdateCategoryHandler = async (
  req: Request<{ id: string; }, {}, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await updateCategory(parseInt(req.params.id), req.body);
    res.status(200).json({
      data: {
        category,
      }
    });
  } catch (error: any) {
    next(error);
  }
};
