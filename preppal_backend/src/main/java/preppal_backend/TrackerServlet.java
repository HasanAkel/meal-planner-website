package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet("/tracker")
public class TrackerServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TrackerDao trackerDao = new TrackerDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (user == null) {
            out.print("{\"status\":\"guest\", \"message\":\"Please log in\"}");
            return;
        }

        String period = request.getParameter("period");
        if (period == null) period = "today";

        try {
            //Get Stats (Average/Total logic)
            Map<String, Object> stats = trackerDao.getNutritionStats(user.getId(), period);

            //Get Recent Meals
            List<Map<String, Object>> recentMeals = trackerDao.getRecentMeals(user.getId());

            //Get Chart Data (Using your existing method!)
            List<Map<String, Object>> history = trackerDao.getWeeklyCalorieData(user.getId());

            // Build JSON Response
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"status\":\"success\",");
            
            //Stats
            json.append("\"stats\":{");
            json.append("\"calories\":").append(stats.get("calories")).append(",");
            json.append("\"protein\":").append(stats.get("protein")).append(",");
            json.append("\"carbs\":").append(stats.get("carbs")).append(",");
            json.append("\"fat\":").append(stats.get("fat"));
            json.append("},");

            // Recent Meals
            json.append("\"recentMeals\":[");
            for (int i = 0; i < recentMeals.size(); i++) {
                Map<String, Object> meal = recentMeals.get(i);
                json.append("{");
                json.append("\"name\":\"").append(escapeJson((String)meal.get("name"))).append("\",");
                json.append("\"calories\":").append(meal.get("calories")).append(",");
                json.append("\"imagePath\":\"").append(escapeJson((String)meal.get("imagePath"))).append("\",");
                json.append("\"consumedDate\":\"").append(meal.get("consumedDate")).append("\"");
                json.append("}");
                if (i < recentMeals.size() - 1) json.append(",");
            }
            json.append("],");

            // History (Chart Data)
            json.append("\"history\":[");
            for (int i = 0; i < history.size(); i++) {
                Map<String, Object> day = history.get(i);
                json.append("{");
                // Map "dayName" (MON, TUE) to "displayDate" for the frontend
                json.append("\"displayDate\":\"").append(day.get("dayName")).append("\",");
                json.append("\"calories\":").append(day.get("calories"));
                json.append("}");
                if (i < history.size() - 1) json.append(",");
            }
            json.append("]");

            json.append("}");
            out.print(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"message\":\"Database error\"}");
        }
    }

        // Simple JSON escape
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
