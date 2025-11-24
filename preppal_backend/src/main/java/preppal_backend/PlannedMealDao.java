package preppal_backend;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class PlannedMealDao {
    private static final String URL = "jdbc:mysql://localhost:3306/preppal?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "";

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

    /** OVERWRITE this week's plan for this user in consumed_meals */
    public boolean savePlannedMeals(int userId, List<PlannedMeal> meals) throws SQLException {
        System.out.println("Saving weekly plan (consumed_meals) for user: " + userId);
        System.out.println("Meals to save: " + meals.size());

        String deleteSql =
                "DELETE FROM consumed_meals " +
                "WHERE user_id = ? AND consumed_date BETWEEN ? AND ?";

        String insertSql =
                "INSERT INTO consumed_meals (user_id, recipe_id, consumed_date, consumed_time) " +
                "VALUES (?, ?, ?, ?)";

        LocalDate startOfWeek = getStartOfWeek();
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);

            // 1) Delete this week's previous plan for this user
            try (PreparedStatement deleteStmt = conn.prepareStatement(deleteSql)) {
                deleteStmt.setInt(1, userId);
                deleteStmt.setDate(2, Date.valueOf(startOfWeek));
                deleteStmt.setDate(3, Date.valueOf(endOfWeek));
                int deletedRows = deleteStmt.executeUpdate();
                System.out.println("Deleted old weekly plan rows: " + deletedRows);
            }

            // 2) Insert new weekly plan rows
            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                int batchCount = 0;
                for (PlannedMeal meal : meals) {
                    if (meal.getRecipeId() > 0 && meal.getPlannedDate() != null) {
                        insertStmt.setInt(1, userId);
                        insertStmt.setInt(2, meal.getRecipeId());
                        insertStmt.setDate(3, Date.valueOf(meal.getPlannedDate()));

                        // you can pick any default time; 12:00 is fine
                        insertStmt.setTime(4, Time.valueOf(LocalTime.of(12, 0)));

                        insertStmt.addBatch();
                        batchCount++;
                    }
                }
                System.out.println("Inserting batch of " + batchCount + " meals");
                insertStmt.executeBatch();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Read this week's saved plan for this user from consumed_meals */
    public List<PlannedMeal> getPlannedMeals(int userId, LocalDate startDate, LocalDate endDate) throws SQLException {
        List<PlannedMeal> meals = new ArrayList<>();

        String sql =
            "SELECT cm.id, cm.user_id, cm.recipe_id, cm.consumed_date, " +
            "       r.name, r.calories, r.protein, r.carbs, r.fat, r.ingredients, r.image_path " +
            "FROM consumed_meals cm " +
            "JOIN recipes r ON cm.recipe_id = r.id " +
            "WHERE cm.user_id = ? AND cm.consumed_date BETWEEN ? AND ? " +
            "ORDER BY cm.consumed_date, cm.id";

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
                    meal.setPlannedDate(rs.getDate("consumed_date").toLocalDate());

                    // derive dayOfWeek from date if you want it
                    meal.setDayOfWeek(meal.getPlannedDate().getDayOfWeek().toString());

                    Recipe recipe = new Recipe();
                    recipe.setId(rs.getInt("recipe_id"));
                    recipe.setName(rs.getString("name"));
                    recipe.setCalories(rs.getInt("calories"));
                    recipe.setProtein(rs.getInt("protein"));
                    recipe.setCarbs(rs.getInt("carbs"));
                    recipe.setFat(rs.getInt("fat"));
                    recipe.setIngredients(rs.getString("ingredients"));
                    recipe.setImagePath(rs.getString("image_path"));

                    meal.setRecipe(recipe);
                    meals.add(meal);
                }
            }
        }
        return meals;
    }

    private LocalDate getStartOfWeek() {
        LocalDate today = LocalDate.now();
        // Sunday = start of week
        return today.minusDays(today.getDayOfWeek().getValue() % 7);
    }
}
