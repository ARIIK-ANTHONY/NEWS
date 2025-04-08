# 🌐 CareerConnect – Tech Jobs & News Portal

Welcome to CareerConnect — a project I created to bridge a real gap that many developers, including myself, often face: finding relevant tech jobs and staying up to date with industry news, all in one place.

## 🚀 The Idea Behind CareerConnect

As someone who’s always exploring new tech opportunities, I realized how scattered the information is across platforms. Job boards and tech news exist in silos. I wanted to build something simple yet meaningful — a tool that brings it all together in a unified, user-friendly web interface. That’s how CareerConnect was born.

It’s not a gimmick. It’s a functional application designed to make a difference for anyone trying to navigate the tech job market or keep up with tech headlines.

---

## 🔧 What It Does

CareerConnect fetches real-time data from two powerful external APIs:

- 🧭 **[Findwork.dev](https://findwork.dev/docs)** – Provides current tech job listings
- 📰 **[NewsAPI.org](https://newsapi.org)** – Offers categorized, up-to-date tech news

Once the data is pulled, users can:

- 🔍 **Search and filter** jobs based on keywords
- 📚 **Browse categorized news** (e.g., Business, Technology, Science)
- 🧠 View a clean, responsive UI that works across desktop and mobile
- 🛠️ Experience error handling when things go wrong with the API

---

## 🖥️ How I Built It (Local Development)

The application was built as a lightweight web app using:

- HTML, CSS, JavaScript for the frontend
- Node.js with Express on the backend
- Two REST API integrations (Jobs & News)
- PM2 to manage backend processes
- Secure handling of API keys using `.env`

To run locally:

```bash
git clone https://github.com/yourusername/careerconnect.git
cd careerconnect
npm install
node server.js
```

Then open `http://localhost:3001` in your browser.

---

## 🌍 Deployment – From Local to Load Balanced

After building the local version, the next step was deployment. I had access to three servers — two web servers and one load balancer — and I set out to make the app accessible online with high availability.

### ⚙️ Here's what I did:

1. **Cloned the app** on both `6405-web-01` and `6405-web-02`
2. **Installed dependencies** and ran the app using `pm2` for process management
3. **Configured Nginx** on each server to reverse proxy incoming requests to the local app on port 3000
4. **Set up Nginx** on `6405-lb-01` to distribute traffic using a round-robin strategy

### 🧪 Testing

Once everything was set up, I tested by hitting the URL:  
👉 (http://oneariik.tech)

It successfully routed requests to both web servers, and I confirmed traffic was being balanced.

---

## 📸 Screenshots

| Jobs Pag                          
|-----------------------------------|
![image](https://github.com/user-attachments/assets/a66330ce-71b3-483e-b944-2be6706f4a7f)
|-----------------------------------|-------------------------------------|

News Page
 |![image](https://github.com/user-attachments/assets/42d68675-27d9-4075-9c70-378fbd0daa68)
|

---

## 🔒 Handling Errors and Security

While developing, I made sure to handle cases like:

- API downtime or network errors
- Empty or invalid responses
- UI feedback when jobs or news couldn’t load

I also avoided hardcoding sensitive keys. All API credentials are stored securely and excluded using `.gitignore`.

---

## 🎬 Demo Video

I recorded a short **2-minute demo** to showcase:

- How to use the app locally
- Real-time job/news fetching
- Server deployment
- Load balancer traffic handling

📽️ [Watch the demo video here](https://yourvideo.link)

---

## 🙏 Acknowledgments

Special thanks to the amazing teams behind:

- **[Findwork.dev](https://findwork.dev/docs)** for tech job data
- **[NewsAPI.org](https://newsapi.org)** for quality news feeds

These APIs made it possible to build a project that feels alive and useful.

---

## 💡 Challenges I Faced

- Setting up HAProxy was tricky at first — I had to tweak configurations several times before it forwarded requests correctly
- Managing backend processes using PM2 taught me how to prepare a Node.js app for production
- Learned to create fallback UIs when the APIs fail, improving the experience for users

---

## 🌟 What’s Next?

This project could evolve into something more:

- Adding **user login** to save favorite jobs
- Integrating **advanced filtering** and **pagination**
- Wrapping the app in **Docker** containers
- Automating deployment with a **CI/CD pipeline**

For now, I’m happy with what it does — and how it serves a real need.

---

## 📎 License

This project is licensed under MIT — free to use and modify with credit.

---

**Built with purpose by ARIIK ANTHONY** ✨  
🌐 (http://oneariik.tech)
