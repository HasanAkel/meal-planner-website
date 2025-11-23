package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/recipes")
public class RecipeServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private RecipeDao recipeDao = new RecipeDao();

    // ============= CREATE (POST) =============
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // Get current user
        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Please log in to add recipes");
            return;
        }

        String name = request.getParameter("name");
        String caloriesStr = request.getParameter("calories");
        String proteinStr = request.getParameter("protein");
        String carbsStr = request.getParameter("carbs");
        String fatStr = request.getParameter("fat");
        String ingredients = request.getParameter("ingredients");
        String imagePath = request.getParameter("image"); // filename only

        int calories = parseInt(caloriesStr);
        int protein = parseInt(proteinStr);
        int carbs = parseInt(carbsStr);
        int fat = parseInt(fatStr);

        Recipe recipe = new Recipe(name, calories, protein, carbs, fat, ingredients, imagePath);
        recipe.setUserId(user.getId());  // ✅ link to owner

        try {
            recipeDao.addRecipe(recipe);

            response.setContentType("text/plain");
            response.getWriter().write("OK");

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    private int parseInt(String s) {
        try {
            if (s != null && !s.isEmpty()) {
                return Integer.parseInt(s);
            }
        } catch (Exception ignored) {}
        return 0;
    }

    // ============= READ (GET) =============
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        List<Recipe> recipes = new ArrayList<>();

        try (PrintWriter out = response.getWriter()) {

            if (user != null) {
                // Only this user's recipes
                recipes = recipeDao.getRecipesByUser(user.getId());
            } else {
                // Guest: no personal recipes 
                recipes = new ArrayList<>();
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

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    // ============= DELETE (DELETE) =============
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing id parameter");
            return;
        }

        int id;
        try {
            id = Integer.parseInt(idParam);
        } catch (NumberFormatException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid id");
            return;
        }

        System.out.println("---- Incoming DELETE /recipes?id=" + id + " ----");

        try {
            boolean deleted = recipeDao.deleteRecipe(id);

            if (deleted) {
                response.setStatus(HttpServletResponse.SC_NO_CONTENT); 
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Recipe not found");
            }

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
