import express, { Router } from 'express';
import { RecipeController } from './recipe.controller';


const recipeRoutes = Router();

// Route to get all recipes
recipeRoutes.get('/recipes', RecipeController.getAllRecipes);

// Route to get a recipe by ID
recipeRoutes.get('/recipes/:id', RecipeController.getRecipeById);

// Route to create a new recipe
recipeRoutes.post('/recipes', RecipeController.createRecipe);

 

export default recipeRoutes
