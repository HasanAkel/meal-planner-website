package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet implementation class PlannerServlet
 */
@WebServlet("/planner")
public class PlannerServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    public PlannerServlet() {
        super();
    }

    private PlannerDao plannerDao = new PlannerDao();
    // Simple JSON string escaper (handles quotes and backslashes)
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        
        try(PrintWriter out = response.getWriter()){
        	
            List<Recipe> recipes = plannerDao.getUserRecepies();
            StringBuilder json = new StringBuilder();
            
            json.append("[");
            for (int i = 0; i < recipes.size(); i++) {
                Recipe r = recipes.get(i);
                json.append("{");
                json.append("\"id\":").append(r.getId()).append(",");
                json.append("\"name\":\"").append(escapeJson(r.getName())).append("\",");
                json.append("\"calories\":").append(r.getCalories()).append(",");
                json.append("\"ingredients\":\"").append(escapeJson(r.getIngredients())).append("\",");
                json.append("\"imagePath\":\"").append(escapeJson(r.getImagePath())).append("\"");
                json.append("}");

                if (i < recipes.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");
            out.print(json.toString());

			
		} catch (Exception e) {
			e.printStackTrace();		
		}
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
