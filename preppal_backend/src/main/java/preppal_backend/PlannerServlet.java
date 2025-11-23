package preppal_backend;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.ArrayList;

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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        System.out.println("PlannerServlet - Session check:");
        System.out.println("Session: " + session);
        System.out.println("User: " + user);

        if (user == null) {
            response.setContentType("application/json");
            response.getWriter().print("{\"status\":\"error\", \"message\":\"Please log in to save meals\"}");
            return;
        }

        String action = request.getParameter("action");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if ("saveMeals".equals(action)) {
            savePlannedMeals(user.getId(), request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Invalid action\"}");
        }
    }

    private void savePlannedMeals(int userId, HttpServletRequest request, PrintWriter out) {
        try {
            String mealsJson = request.getParameter("meals");

            // Simple manual JSON parsing
            List<PlannedMeal> meals = parseMealsJson(mealsJson);

            PlannedMealDao plannedMealDao = new PlannedMealDao();
            boolean success = plannedMealDao.savePlannedMeals(userId, meals);

            if (success) {
                out.print("{\"status\":\"success\", \"message\":\"Meal plan saved successfully!\"}");
            } else {
                out.print("{\"status\":\"error\", \"message\":\"Failed to save meal plan\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"message\":\"Error: \" + e.getMessage()}");
        }
    }

    // Simple JSON parser for our specific format
    private List<PlannedMeal> parseMealsJson(String json) {
        List<PlannedMeal> meals = new ArrayList<>();

        if (json == null || json.trim().isEmpty()) {
            return meals;
        }

        // Remove brackets and split by objects
        String content = json.substring(1, json.length() - 1);
        String[] objects = content.split("\\},\\{");

        for (String obj : objects) {
            // Clean up the object string
            obj = obj.replace("{", "").replace("}", "");
            String[] pairs = obj.split(",");

            PlannedMeal meal = new PlannedMeal();

            for (String pair : pairs) {
                String[] keyValue = pair.split(":");
                if (keyValue.length == 2) {
                    String key = keyValue[0].replace("\"", "").trim();
                    String value = keyValue[1].replace("\"", "").trim();

                    switch (key) {
                    case "recipeId":
                        meal.setRecipeId(Integer.parseInt(value));
                        break;
                    case "dayOfWeek":
                        meal.setDayOfWeek(value);
                        break;
                    case "plannedDate":
                        meal.setPlannedDate(java.time.LocalDate.parse(value));
                        break;
                    }
                }
            }

            meals.add(meal);
        }

        return meals;
    }

    //UPDATED doGet WITH PROTEIN, CARBS, FAT
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

                //NEW JSON FIELDS
                json.append("\"protein\":").append(r.getProtein()).append(",");
                json.append("\"carbs\":").append(r.getCarbs()).append(",");
                json.append("\"fat\":").append(r.getFat()).append(",");

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
}
