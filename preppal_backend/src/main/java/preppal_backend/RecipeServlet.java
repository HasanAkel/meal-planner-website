package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/recipes")
public class RecipeServlet extends HttpServlet {

    private RecipeDao dao = new RecipeDao();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        int calories = Integer.parseInt(request.getParameter("calories"));
        String ingredients = request.getParameter("ingredients");
        String imagePath = request.getParameter("image"); // for now: just filename or text

        Recipe r = new Recipe();
        r.setName(name);
        r.setCalories(calories);
        r.setIngredients(ingredients);
        r.setImagePath(imagePath);

        try {
            dao.addRecipe(r);
            // after create: either redirect or return JSON
            response.sendRedirect("recipes.html"); // simplest: reload page
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        try (PrintWriter out = response.getWriter()) {
            List<Recipe> recipes = dao.getAllRecipes();
            // Very simple JSON output (or use Jackson like in your shopping list example)
            out.print("[");
            for (int i = 0; i < recipes.size(); i++) {
                Recipe r = recipes.get(i);
                out.print("{\"name\":\"" + r.getName() + "\","
                        + "\"calories\":" + r.getCalories() + ","
                        + "\"ingredients\":\"" + r.getIngredients() + "\"}");
                if (i < recipes.size() - 1) out.print(",");
            }
            out.print("]");
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }
}

