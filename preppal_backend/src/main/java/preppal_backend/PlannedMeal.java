package preppal_backend;

import java.time.LocalDate;

public class PlannedMeal {
    private int id;
    private int userId;
    private int recipeId;
    private String dayOfWeek;
    private LocalDate plannedDate;
    private Recipe recipe;

    public PlannedMeal() {}

    public PlannedMeal(int userId, int recipeId, String dayOfWeek, LocalDate plannedDate) {
        this.userId = userId;
        this.recipeId = recipeId;
        this.dayOfWeek = dayOfWeek;
        this.plannedDate = plannedDate;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getRecipeId() { return recipeId; }
    public void setRecipeId(int recipeId) { this.recipeId = recipeId; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalDate getPlannedDate() { return plannedDate; }
    public void setPlannedDate(LocalDate plannedDate) { this.plannedDate = plannedDate; }

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
}