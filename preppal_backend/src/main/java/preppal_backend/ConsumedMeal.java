package preppal_backend;

import java.time.LocalDate;
import java.time.LocalTime;

public class ConsumedMeal {
    private int id;
    private int userId;
    private int recipeId;
    private LocalDate consumedDate;
    private LocalTime consumedTime;
    private Recipe recipe;

    // Constructors, Getters and Setters
    public ConsumedMeal() {}

    public ConsumedMeal(int userId, int recipeId, LocalDate consumedDate, LocalTime consumedTime) {
        this.userId = userId;
        this.recipeId = recipeId;
        this.consumedDate = consumedDate;
        this.consumedTime = consumedTime;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getRecipeId() { return recipeId; }
    public void setRecipeId(int recipeId) { this.recipeId = recipeId; }

    public LocalDate getConsumedDate() { return consumedDate; }
    public void setConsumedDate(LocalDate consumedDate) { this.consumedDate = consumedDate; }

    public LocalTime getConsumedTime() { return consumedTime; }
    public void setConsumedTime(LocalTime consumedTime) { this.consumedTime = consumedTime; }

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
}