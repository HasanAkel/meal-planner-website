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

    private static final String URL = "jdbc:mysql://localhost:3306/preppal";
    private static final String USER = "root";
    private static final String PASSWORD = "yourPassword";

    public void addRecipe(Recipe r) throws SQLException {
        String sql = "INSERT INTO recipes(name, calories, ingredients, image_path) VALUES (?,?,?,?)";
        try (Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, r.getName());
            ps.setInt(2, r.getCalories());
            ps.setString(3, r.getIngredients());
            ps.setString(4, r.getImagePath());
            ps.executeUpdate();
        }
    }

    public List<Recipe> getAllRecipes() throws SQLException {
        List<Recipe> list = new ArrayList<>();
        String sql = "SELECT * FROM recipes";
        try (Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
             Statement st = con.createStatement();
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
