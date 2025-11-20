package preppal_backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class PlannerDao {

	
    // JDBC connection info
    private static final String URL = "jdbc:mysql://localhost:3306/preppal?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "____"; // <– put your real password

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

//	modify to get users recipes 
    public List<Recipe> getUserRecepies(){
    	
    	List<Recipe> list = new ArrayList<>();
    	
    	try (Connection conn = getConnection()){
    		
    		String sql = "SELECT id, name, calories, ingredients, image_path FROM recipes";
    		try(Statement st = conn.createStatement()){
    			
    			ResultSet rs = st.executeQuery(sql);
    			while(rs.next()) {
    				
                    Recipe r = new Recipe();
                    r.setId(rs.getInt("id"));
                    r.setName(rs.getString("name"));
                    r.setCalories(rs.getInt("calories"));
                    r.setIngredients(rs.getString("ingredients"));
                    r.setImagePath(rs.getString("image_path"));

                    list.add(r);

    			}
				
			} catch (Exception e) {
				e.printStackTrace();
			}
    		
    		
    	}catch(SQLException e) {
    		e.printStackTrace();
    	}
    	
    	return list;
    	
    	
    }
    
    
    

}
