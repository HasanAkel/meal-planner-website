package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/planner")
public class PlannerServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private PlannerDao plannerDao = new PlannerDao();
    private PlannedMealDao plannedMealDao = new PlannedMealDao();
    private TrackerDao trackerDao = new TrackerDao();   // used to mirror into consumed_meals

    public PlannerServlet() {
        super();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    // =============== POST (save weekly plan) =================
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (user == null) {
            out.print("{\"status\":\"error\", \"message\":\"Please log in to save meals\"}");
            return;
        }

        String action = request.getParameter("action");
        if ("saveMeals".equals(action)) {
            savePlannedMeals(user.getId(), request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Invalid action\"}");
        }
    }

    private void savePlannedMeals(int userId, HttpServletRequest request, PrintWriter out) {
        try {
            String mealsJson = request.getParameter("meals");
            List<PlannedMeal> meals = parseMealsJson(mealsJson);

            // 1) Save weekly plan into planned_meals (for reloading in planner)
            boolean successPlan = plannedMealDao.savePlannedMeals(userId, meals);

            // 2) Mirror the same plan into consumed_meals (assume planned = consumed)
            //    IMPORTANT: this method must insert using meal.getPlannedDate() as consumed_date
            boolean successConsumed = trackerDao.savePlannedMealsAsConsumed(userId, meals);

            if (successPlan && successConsumed) {
                out.print("{\"status\":\"success\", \"message\":\"Meal plan saved successfully!\"}");
            } else {
                out.print("{\"status\":\"error\", \"message\":\"Failed to save meal plan\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print(
                "{\"status\":\"error\", \"message\":\"Error: " + escapeJson(e.getMessage()) + "\"}"
            );
        }
    }

    // very small manual parser for the JSON array: [{...}, {...}]
    private List<PlannedMeal> parseMealsJson(String json) {
        List<PlannedMeal> meals = new ArrayList<>();

        if (json == null || json.trim().isEmpty()) {
            return meals;
        }

        // remove [ ]
        String content = json.substring(1, json.length() - 1).trim();
        if (content.isEmpty()) return meals;

        String[] objects = content.split("\\},\\{");

        for (String obj : objects) {
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
                            meal.setPlannedDate(LocalDate.parse(value));
                            break;
                    }
                }
            }

            meals.add(meal);
        }

        return meals;
    }

    // =============== GET =================
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        String action = request.getParameter("action");

        try (PrintWriter out = response.getWriter()) {

            // 1) Frontend asks for saved plan -> return planned_meals for this week
            if ("getSavedPlan".equals(action)) {

                if (user == null) {
                    out.print("[]");
                    return;
                }

                LocalDate today = LocalDate.now();
                // Sunday as start of week
                LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() % 7);
                LocalDate endOfWeek = startOfWeek.plusDays(6);

                List<PlannedMeal> meals =
                        plannedMealDao.getPlannedMeals(user.getId(), startOfWeek, endOfWeek);

                StringBuilder json = new StringBuilder();
                json.append("[");

                for (int i = 0; i < meals.size(); i++) {
                    PlannedMeal pm = meals.get(i);
                    Recipe r = pm.getRecipe();

                    json.append("{");
                    json.append("\"recipeId\":").append(pm.getRecipeId()).append(",");
                    json.append("\"dayOfWeek\":\"").append(escapeJson(pm.getDayOfWeek())).append("\",");
                    json.append("\"plannedDate\":\"").append(pm.getPlannedDate()).append("\",");

                    if (r != null && r.getName() != null) {
                        json.append("\"name\":\"").append(escapeJson(r.getName())).append("\"");
                    } else {
                        json.append("\"name\":\"\"");
                    }

                    json.append("}");

                    if (i < meals.size() - 1) {
                        json.append(",");
                    }
                }

                json.append("]");
                out.print(json.toString());
                return;
            }

            // 2) Default: return this user's recipes (for dropdowns in planner)
            List<Recipe> recipes = new ArrayList<>();
            if (user != null) {
                recipes = plannerDao.getUserRecepies(user.getId());
            }

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < recipes.size(); i++) {
                Recipe r = recipes.get(i);
                json.append("{");
                json.append("\"id\":").append(r.getId()).append(",");
                json.append("\"name\":\"").append(escapeJson(r.getName())).append("\",");
                json.append("\"calories\":").append(r.getCalories()).append(",");
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
