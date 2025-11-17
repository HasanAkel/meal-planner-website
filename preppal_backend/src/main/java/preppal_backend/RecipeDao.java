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

    // JDBC connection info
    private static final String URL = "jdbc:mysql://localhost:3306/preppal?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = ""; // <– put your real password


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

    // INSERT new recipe
    public void addRecipe(Recipe recipe) throws SQLException {
        String sql = "INSERT INTO recipes (name, calories, ingredients, image_path) " +
                     "VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, recipe.getName());
            ps.setInt(2, recipe.getCalories());
            ps.setString(3, recipe.getIngredients());
            ps.setString(4, recipe.getImagePath());
            ps.executeUpdate();
        }
    }

    // SELECT * FROM recipes
    public List<Recipe> getAllRecipes() throws SQLException {
        List<Recipe> list = new ArrayList<>();

        String sql = "SELECT id, name, calories, ingredients, image_path FROM recipes";

        try (Connection conn = getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                Recipe r = new Recipe();
                r.setId(rs.getInt("id"));
                r.setName(rs.getString("name"));
                r.setCalories(rs.getInt("calories"));
                r.setIngredients(rs.getString("ingredients"));
                r.setImagePath(rs.getString("image_path"));

                list.add(r);
            }
        }

        return list;
    }
}

