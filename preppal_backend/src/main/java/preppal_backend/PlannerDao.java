package preppal_backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PlannerDao {

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

    public List<Recipe> getUserRecepies(int userId){
        
        List<Recipe> list = new ArrayList<>();
        
        String sql = "SELECT id, name, calories, protein, carbs, fat, ingredients, image_path "
                   + "FROM recipes WHERE user_id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    Recipe r = new Recipe();
                    r.setId(rs.getInt("id"));
                    r.setName(rs.getString("name"));
                    r.setCalories(rs.getInt("calories"));
                    r.setProtein(rs.getInt("protein"));
                    r.setCarbs(rs.getInt("carbs"));
                    r.setFat(rs.getInt("fat"));
                    r.setIngredients(rs.getString("ingredients"));
                    r.setImagePath(rs.getString("image_path"));
                    r.setUserId(userId);
                    list.add(r);
                }
            }
            
        } catch(SQLException e) {
            e.printStackTrace();
        }
        
        return list;
    }
}
