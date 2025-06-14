import { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { Recipe } from '../../models/Recipe.model';
import { Inventory } from '../../models/Inventory.model';
export const RecipeController = {

    getAllRecipes: async (req: Request, res: Response) => {
        try {
            const recipeRepository = AppDataSource.getRepository(Recipe); // Use getRepository via DataSource
            const recipes = await recipeRepository
                .createQueryBuilder('recipe')
                .leftJoinAndSelect('recipe.ingredient', 'inventory') // Join Inventory table to get ingredient details
                .getMany();

            if (!recipes) {
                res.status(404).json({ message: 'No recipes found' });
                return
            }

            res.status(200).json(recipes); // Return all recipes
            return
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching recipes' });
            return
        }
    },

    getRecipeById: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const recipeRepository = AppDataSource.getRepository(Recipe); // Use getRepository via DataSource
            const recipe = await recipeRepository
                .createQueryBuilder('recipe')
                .leftJoinAndSelect('recipe.ingredient', 'inventory')
                .where('recipe.id = :id', { id })
                .getOne();

            if (!recipe) {
                res.status(404).json({ message: 'Recipe not found' });
                return
            }

            res.status(200).json(recipe); // Return the recipe by ID
            return
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching recipe' });
            return

        }
    },

    createRecipe: async (req: Request, res: Response) => {
        const { ingredientId, quantityNeeded } = req.body;

        try {
            const inventoryRepository = AppDataSource.getRepository(Inventory); // Use getRepository via DataSource
            const ingredient = await inventoryRepository.findOne({ where: { id: ingredientId } });

            if (!ingredient) {
                res.status(404).json({ message: 'Ingredient not found' });
                return
            }

            const recipeRepository = AppDataSource.getRepository(Recipe); // Use getRepository via DataSource
            const recipe = new Recipe();
            recipe.ingredient = ingredient;
            recipe.quantityNeeded = quantityNeeded;

            const savedRecipe = await recipeRepository.save(recipe);

            res.status(201).json(savedRecipe); // Return the created recipe
            return
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating recipe' });
            return
        }
    }

}