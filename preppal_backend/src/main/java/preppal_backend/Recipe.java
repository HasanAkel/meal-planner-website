package preppal_backend;

public class Recipe {

    private int id;
    private String name;
    private int calories;
    private String ingredients;
    private String imagePath;

    // ----- Constructors -----

    // default constructor (empty)
    public Recipe() {
    }

    // Non-default Constructor 
    public Recipe(String name, int calories, String ingredients, String imagePath) {
        this.name = name;
        this.calories = calories;
        this.ingredients = ingredients;
        this.imagePath = imagePath;
    }


    public Recipe(int id, String name, int calories, String ingredients, String imagePath) {
        this.id = id;
        this.name = name;
        this.calories = calories;
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

