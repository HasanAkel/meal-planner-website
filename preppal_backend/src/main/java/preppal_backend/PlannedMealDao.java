package preppal_backend;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PlannedMealDao {
    private static final String URL = "jdbc:mysql://localhost:3306/preppal?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "";  //Enter password here

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // Save planned meals for a week
    public boolean savePlannedMeals(int userId, List<PlannedMeal> meals) throws SQLException {
        System.out.println("Saving planned meals for user: " + userId);
        System.out.println("Number of meals to save: " + meals.size());
        
        String deleteSql = "DELETE FROM planned_meals WHERE user_id = ? AND planned_date BETWEEN ? AND ?";
        String insertSql = "INSERT INTO planned_meals (user_id, recipe_id, day_of_week, planned_date) VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);

            // Get date range for the current week (Sunday to Saturday)
            LocalDate startOfWeek = getStartOfWeek();
            LocalDate endOfWeek = startOfWeek.plusDays(6);

            System.out.println("Date range: " + startOfWeek + " to " + endOfWeek);

            // Delete existing plans for this week
            try (PreparedStatement deleteStmt = conn.prepareStatement(deleteSql)) {
                deleteStmt.setInt(1, userId);
                deleteStmt.setDate(2, Date.valueOf(startOfWeek));
                deleteStmt.setDate(3, Date.valueOf(endOfWeek));
                int deletedRows = deleteStmt.executeUpdate();
                System.out.println("Deleted " + deletedRows + " existing meals");
            }

            // Insert new plans
            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                int batchCount = 0;
                for (PlannedMeal meal : meals) {
                    if (meal.getRecipeId() > 0) {
                        insertStmt.setInt(1, userId);
                        insertStmt.setInt(2, meal.getRecipeId());
                        insertStmt.setString(3, meal.getDayOfWeek());
                        insertStmt.setDate(4, Date.valueOf(meal.getPlannedDate()));
                        insertStmt.addBatch();
                        batchCount++;
                        
                        System.out.println("Adding meal to batch: " + meal.getDayOfWeek() + " - Recipe ID: " + meal.getRecipeId());
                    }
                }
                
                System.out.println("Executing batch with " + batchCount + " meals");
                int[] results = insertStmt.executeBatch();
                System.out.println("Batch executed, " + results.length + " results");
            }

            conn.commit();
            System.out.println("Meals saved successfully!");
            return true;
        } catch (SQLException e) {
            System.err.println("Error saving planned meals:");
            e.printStackTrace();
            return false;
        }
    }
    // Get planned meals for a user in a date range
    public List<PlannedMeal> getPlannedMeals(int userId, LocalDate startDate, LocalDate endDate) throws SQLException {
        List<PlannedMeal> meals = new ArrayList<>();
        String sql = "SELECT pm.*, r.name, r.calories, r.protein, r.carbs, r.ingredients, r.image_path " +
                    "FROM planned_meals pm " +
                    "JOIN recipes r ON pm.recipe_id = r.id " +
                    "WHERE pm.user_id = ? AND pm.planned_date BETWEEN ? AND ? " +
                    "ORDER BY pm.planned_date";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setDate(2, Date.valueOf(startDate));
            ps.setDate(3, Date.valueOf(endDate));

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PlannedMeal meal = new PlannedMeal();
                    meal.setId(rs.getInt("id"));
                    meal.setUserId(rs.getInt("user_id"));
                    meal.setRecipeId(rs.getInt("recipe_id"));
                    meal.setDayOfWeek(rs.getString("day_of_week"));
                    meal.setPlannedDate(rs.getDate("planned_date").toLocalDate());

                    Recipe recipe = new Recipe();
                    recipe.setId(rs.getInt("recipe_id"));
                    recipe.setName(rs.getString("name"));
                    recipe.setCalories(rs.getInt("calories"));
                    recipe.setProtein(rs.getInt("protein"));
                    recipe.setCarbs(rs.getInt("carbs"));
                    recipe.setIngredients(rs.getString("ingredients"));
                    recipe.setImagePath(rs.getString("image_path"));

                    meal.setRecipe(recipe);
                    meals.add(meal);
                }
            }
        }
        return meals;
    }

    // Helper method to get start of current week (Sunday)
    private LocalDate getStartOfWeek() {
        LocalDate today = LocalDate.now();
        return today.minusDays(today.getDayOfWeek().getValue() % 7); // Adjust to Sunday start
    }
}
