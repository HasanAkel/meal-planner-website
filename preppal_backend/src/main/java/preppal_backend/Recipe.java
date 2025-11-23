package preppal_backend;

public class Recipe {

    private int id;
    private String name;
    private int calories;
    private int protein;     
    private int carbs;       
    private int fat;
    private String ingredients;
    private String imagePath;

    // ----- Constructors -----

    // default constructor (empty)
    public Recipe() {
    }

    // Non-default constructor 
    public Recipe(String name, int calories, int protein, int carbs, int fat, String ingredients, String imagePath) {
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.ingredients = ingredients;
        this.imagePath = imagePath;
    }

    // Full constructor 
    public Recipe(int id, String name, int calories, int protein, int carbs, int fat, String ingredients, String imagePath) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.ingredients = ingredients;
        this.imagePath = imagePath;
    }

    // ----- Getters & Setters -----

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getProtein() {
        return protein;
    }

    public void setProtein(int protein) {
        this.protein = protein;
    }

    public int getCarbs() {
        return carbs;
    }

    public void setCarbs(int carbs) {
        this.carbs = carbs;
    }
    public int getFat() { return fat; }
    public void setFat(int fat) { this.fat = fat; }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
    
}
