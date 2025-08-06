# 🚀 VNG GLASS - DEPLOYMENT GUIDE

## 🔥 OPTION 1: RAILWAY (RECOMMENDED)

### ✅ Why Railway?
- **FREE Tier**: 500 hours/month free
- **Auto HTTPS**: Automatic SSL certificates
- **Custom Domain**: Free .railway.app subdomain
- **Easy Deploy**: Git-based deployment
- **.NET Support**: Native Docker support

### 📋 Step-by-Step Railway Deployment:

#### **1. Prepare Repository**
```bash
# Initialize git (if not done)
cd "D:\Work Space\SEP490_G92\SEP490"
git init
git add .
git commit -m "Initial commit for Railway deployment"

# Push to GitHub (required for Railway)
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/VNG_Glass_API.git
git branch -M main
git push -u origin main
```

#### **2. Setup Railway Account**
1. **Visit**: https://railway.app/
2. **Sign up** with GitHub account
3. **Connect** your GitHub repositories

#### **3. Deploy Project**
1. **Dashboard** → **New Project** → **Deploy from GitHub repo**
2. **Select** your VNG_Glass_API repository
3. **Service Name**: `vng-glass-api`
4. **Environment**: Production

#### **4. Configure Environment Variables**
```bash
# Railway Dashboard → Your Project → Variables tab
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:$PORT

# Zalo Configuration (update with real values)
Zalo__AccessToken=YOUR_REAL_ACCESS_TOKEN
Zalo__OAId=YOUR_REAL_OA_ID
Zalo__AppId=YOUR_REAL_APP_ID
Zalo__AppSecret=YOUR_REAL_APP_SECRET
```

#### **5. Get Your Domain**
```bash
# After deployment, Railway provides:
# https://your-app-name.railway.app

# Example: https://vng-glass-api.railway.app
# Your API endpoint: https://vng-glass-api.railway.app/api/ZaloDynamic/chat
```

---

## 🔷 OPTION 2: AZURE APP SERVICE

### ✅ Why Azure?
- **Best for .NET**: Native Microsoft support
- **Free Tier**: F1 plan available
- **Easy Integration**: Visual Studio integration
- **Scalable**: Easy to upgrade

### 📋 Azure Deployment:

#### **1. Install Azure CLI**
```bash
# Download: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
# Or use Visual Studio publish directly
```

#### **2. Deploy via Visual Studio**
```bash
# Right-click project → Publish → Azure App Service
# Follow wizard to create new App Service
# Choose: F1 (Free) plan
```

#### **3. Get Your URL**
```bash
# Azure provides: https://your-app-name.azurewebsites.net
# API endpoint: https://your-app-name.azurewebsites.net/api/ZaloDynamic/chat
```

---

## 🔶 OPTION 3: DIGITALOCEAN APP PLATFORM

### ✅ Why DigitalOcean?
- **$200 Free Credit**: For new users
- **Simple Pricing**: Predictable costs
- **Good Performance**: Fast deployment

### 📋 DigitalOcean Deployment:

#### **1. Create Account**
```bash
# Visit: https://cloud.digitalocean.com/
# Sign up → Get $200 credit
```

#### **2. Create App**
```bash
# Apps → Create App → GitHub
# Select your repository
# Choose: Basic plan ($5/month after credits)
```

---

## 🔸 OPTION 4: HEROKU (Container Deploy)

### ✅ Why Heroku?
- **Easy Setup**: Simple deployment
- **Free Tier**: 1000 dyno hours/month
- **Add-ons**: Many integrations

### 📋 Heroku Deployment:

#### **1. Install Heroku CLI**
```bash
# Download: https://devcenter.heroku.com/articles/heroku-cli
```

#### **2. Deploy with Docker**
```bash
# Login
heroku login

# Create app
heroku create vng-glass-api

# Set environment variables
heroku config:set ASPNETCORE_ENVIRONMENT=Production -a vng-glass-api

# Deploy container
heroku container:push web -a vng-glass-api
heroku container:release web -a vng-glass-api
```

---

## 🧪 TESTING DEPLOYMENT

### **1. Test Health Endpoint**
```bash
curl https://your-domain.com/api/ZaloTest/status
```

### **2. Test Dynamic API**
```bash
curl -X POST "https://your-domain.com/api/ZaloDynamic/chat" \
-H "Content-Type: application/json" \
-d '{
  "userId": "deploy_test_001",
  "message": "Bắt đầu"
}'
```

### **3. Expected Response**
```json
{
  "version": "chatbot",
  "content": {
    "messages": [
      {
        "type": "text",
        "text": "🚀 **BẮT ĐẦU PHIÊN CHAT MỚI!**",
        "buttons": [...]
      }
    ]
  }
}
```

---

## 📱 ZALO INTEGRATION

### **After Successful Deployment:**

#### **1. Update Zalo OA Dashboard**
```bash
# Login: https://oa.zalo.me/
# Chatbot → Dynamic API Configuration
# API URL: https://your-deployed-domain.com/api/ZaloDynamic/chat
```

#### **2. Test Integration**
```bash
# Send message in Zalo chat:
# "Bắt đầu" → Should trigger your API
```

---

## 🔧 TROUBLESHOOTING

### **Common Issues:**

#### **1. Port Binding Error**
```bash
# Ensure Dockerfile uses:
ENV ASPNETCORE_URLS=http://+:$PORT
```

#### **2. Database Connection**
```bash
# Update connection string for cloud database
# Or use in-memory database for testing
```

#### **3. CORS Issues**
```csharp
// Add in Program.cs
app.UseCors(builder => 
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader());
```

---

## 🎯 RECOMMENDATION

### **For Quick Testing: RAILWAY**
- ✅ **Fastest setup**: 5 minutes
- ✅ **Auto HTTPS**: No SSL setup needed
- ✅ **Free tier**: 500 hours/month
- ✅ **Git-based**: Auto redeploy on push

### **For Production: AZURE**
- ✅ **Best .NET support**: Native integration
- ✅ **Enterprise ready**: Scaling & monitoring
- ✅ **Microsoft ecosystem**: Easy management

---

## 🚀 QUICK START WITH RAILWAY

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Deploy to Railway"
git remote add origin https://github.com/YOUR_USERNAME/VNG_Glass_API.git
git push -u origin main

# 2. Deploy on Railway
# - Visit: https://railway.app/
# - Connect GitHub → Select repo → Deploy

# 3. Get domain & test
curl https://your-app.railway.app/api/ZaloDynamic/chat

# 4. Configure in Zalo OA
# Dynamic API URL: https://your-app.railway.app/api/ZaloDynamic/chat
```

**🎉 Ready for Zalo Chatbot integration!** 