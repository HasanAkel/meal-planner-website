package preppal_backend;

public class User {
    private int id;
    private String username;
    private String password;
    private String email;
    // Bio Data
    private double height;
    private double weight;
    private int age;
    private String goal;

    // Constructors
    public User() {}

    public User(String username, String password, String email, double height, double weight, int age, String goal) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.height = height;
        this.weight = weight;
        this.age = age;
        this.goal = goal;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
}