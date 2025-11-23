package preppal_backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class RecipeDao {

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

    
    
    // ============= CREATE =============
    public void addRecipe(Recipe recipe) throws SQLException {

        String sql = "INSERT INTO recipes (name, calories, protein, carbs, fat, ingredients, image_path, user_id) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, recipe.getName());
            ps.setInt(2, recipe.getCalories());
            ps.setInt(3, recipe.getProtein());
            ps.setInt(4, recipe.getCarbs());
            ps.setInt(5, recipe.getFat());
            ps.setString(6, recipe.getIngredients());
            ps.setString(7, recipe.getImagePath());

            if (recipe.getUserId() > 0) {
                ps.setInt(8, recipe.getUserId());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }

            ps.executeUpdate();
        }
    }

    
    
    // ============= READ =============
    public List<Recipe> getAllRecipes() throws SQLException {
        List<Recipe> list = new ArrayList<>();

        String sql = "SELECT id, name, calories, protein, carbs, fat, ingredients, image_path, user_id FROM recipes";

        try (Connection conn = getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                Recipe r = new Recipe();
                r.setId(rs.getInt("id"));
                r.setName(rs.getString("name"));
                r.setCalories(rs.getInt("calories"));
                r.setProtein(rs.getInt("protein"));
                r.setCarbs(rs.getInt("carbs"));
                r.setFat(rs.getInt("fat"));
                r.setIngredients(rs.getString("ingredients"));
                r.setImagePath(rs.getString("image_path"));
                r.setUserId(rs.getInt("user_id"));
                list.add(r);
            }
        }

        return list;
    }

    
    // ============= READ by user =============
    public List<Recipe> getRecipesByUser(int userId) throws SQLException {
        List<Recipe> list = new ArrayList<>();

        String sql = "SELECT id, name, calories, protein, carbs, fat, ingredients, image_path, user_id "
                   + "FROM recipes WHERE user_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Recipe r = new Recipe();
                    r.setId(rs.getInt("id"));
                    r.setName(rs.getString("name"));
                    r.setCalories(rs.getInt("calories"));
                    r.setProtein(rs.getInt("protein"));
                    r.setCarbs(rs.getInt("carbs"));
                    r.setFat(rs.getInt("fat"));
                    r.setIngredients(rs.getString("ingredients"));
                    r.setImagePath(rs.getString("image_path"));
                    r.setUserId(rs.getInt("user_id"));
                    list.add(r);
                }
            }
        }

        return list;
    }

    
    // ============= DELETE =============
    public boolean deleteRecipe(int id) throws SQLException {
        String sql = "DELETE FROM recipes WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();
            return rows > 0;
        }
    }
}
