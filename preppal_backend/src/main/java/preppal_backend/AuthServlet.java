package preppal_backend;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/auth") 
public class AuthServlet extends HttpServlet {
    
    private UserDao userDao = new UserDao();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // We will use a simple "action" parameter to decide if we are logging in or registering
        String action = request.getParameter("action");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if ("register".equals(action)) {
            handleRegister(request, out);
        } else if ("login".equals(action)) {
            handleLogin(request, response, out);
        } else if ("logout".equals(action)) {
            handleLogout(request, response);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Invalid action\"}");
        }
    }
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        
        if (user != null) {
            out.print("{\"status\":\"logged_in\", \"username\":\"" + user.getUsername() + "\"}");
        } else {
            out.print("{\"status\":\"guest\"}");
        }
    }


    private void handleRegister(HttpServletRequest request, PrintWriter out) {
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // 1. Check if user exists
        if (userDao.isUsernameTaken(username)) {
            out.print("{\"status\":\"error\", \"message\":\"Username already taken\"}");
            return;
        }

        // 2. Create User Object with all fields
        User user = new User(
            username,
            password,
            request.getParameter("email"),
            Double.parseDouble(request.getParameter("height")),
            Double.parseDouble(request.getParameter("weight")),
            Integer.parseInt(request.getParameter("age")),
            request.getParameter("goal")
        );

        // 3. Save to DB
        boolean success = userDao.registerUser(user);
        if (success) {
            // AUTO-LOGIN AFTER REGISTRATION

            // Re-fetch user from DB with correct id + fields
            User loggedInUser = userDao.checkLogin(username, password);

            if (loggedInUser != null) {
                // Create session and store user (same as login)
                HttpSession session = request.getSession(true);
                session.setAttribute("user", loggedInUser);

                out.print(
                    "{"
                        + "\"status\":\"success\","
                        + "\"message\":\"Registration complete!\","
                        + "\"username\":\"" + loggedInUser.getUsername() + "\""
                    + "}"
                );
            } else {
                // Fallback: registered but couldn't auto-login (rare)
                out.print(
                    "{"
                        + "\"status\":\"success\","
                        + "\"message\":\"Registration complete! Please log in.\","
                        + "\"username\":\"" + username + "\""
                    + "}"
                );
            }
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Database error during registration\"}");
        }
    }


    private void handleLogin(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        User user = userDao.checkLogin(
            request.getParameter("username"), 
            request.getParameter("password")
        );

        if (user != null) {
            // 4. Create a Session (This logs them in on the server side)
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            
            out.print("{\"status\":\"success\", \"message\":\"Login successful\", \"username\":\"" + user.getUsername() + "\"}");
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Invalid username or password\"}");
        }
    }
    
    private void handleLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false); // Get existing session
        if (session != null) {
            session.invalidate(); // Destroy session
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print("{\"status\":\"logged_out\"}");
    }

}