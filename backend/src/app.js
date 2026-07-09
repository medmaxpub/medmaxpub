// import cookieParser from "cookie-parser";
// import cors from "cors";
// import express from "express";
// import "./config/env.js";
// import routes from "./routes/index.js";
// import { errorHandler, notFound } from "./middleware/errorHandler.js";
// import { uploadsRoot } from "./utils/assetStorage.js";

// const app = express();
// const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://medmaxpub.pages.dev"];
// const configuredOrigins = [
//   process.env.FRONTEND_URL,
//   process.env.CLIENT_URL,
//   process.env.CORS_ORIGINS
// ]
//   .filter(Boolean)
//   .flatMap((value) => value.split(","))
//   .map((value) => value.trim())
//   .filter(Boolean);
// const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];
// const allowedOriginHostnames = ["medmaxpub.pages.dev"];
// const defaultAllowedHeaders = ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"];
// const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

// function matchesAllowedOrigin(origin) {
//   if (!origin) {
//     return true;
//   }

//   if (allowedOrigins.includes(origin)) {
//     return true;
//   }

//   try {
//     const { hostname, protocol } = new URL(origin);

//     if (protocol !== "https:") {
//       return false;
//     }

//     return allowedOriginHostnames.some((allowedHostname) => hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`));
//   } catch {
//     return false;
//   }
// }

// const corsOptions = {
//   origin(origin, callback) {
//     if (matchesAllowedOrigin(origin)) {
//       callback(null, true);
//       return;
//     }

//     callback(new Error(`CORS blocked for origin: ${origin}`));
//   },
//   credentials: true,
//   methods: allowedMethods,
//   allowedHeaders: defaultAllowedHeaders,
//   exposedHeaders: ["Content-Disposition", "Content-Type"],
//   optionsSuccessStatus: 204
// };

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (matchesAllowedOrigin(origin)) {
//     if (origin) {
//       res.setHeader("Access-Control-Allow-Origin", origin);
//       res.setHeader("Vary", "Origin");
//     }

//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       req.headers["access-control-request-headers"] || defaultAllowedHeaders.join(", ")
//     );
//     res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");
//   }

//   if (req.method === "OPTIONS") {
//     res.status(204).end();
//     return;
//   }

//   next();
// });

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
// app.use(cookieParser());
// app.use(express.json({ limit: "2mb" }));
// app.use(express.urlencoded({ extended: true, limit: "2mb" }));
// app.use(
//   "/uploads",
//   express.static(uploadsRoot, {
//     setHeaders(res, filePath) {
//       const normalizedPath = String(filePath || "").toLowerCase();

//       if (normalizedPath.endsWith(".pdf")) {
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "inline");
//       }
//     }
//   })
// );

// app.use("/api", routes);
// app.use(notFound);
// app.use(errorHandler);

// export default app;
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { uploadsRoot } from "./utils/assetStorage.js";

// ✅ Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Path to the frontend build output (relative to backend/src/)
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

const app = express();
const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://medmaxpub.pages.dev"];
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGINS
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];
const allowedOriginHostnames = ["medmaxpub.pages.dev"];
const defaultAllowedHeaders = ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"];
const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

function matchesAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);

    if (protocol !== "https:") {
      return false;
    }

    return allowedOriginHostnames.some((allowedHostname) => hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`));
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (matchesAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders: defaultAllowedHeaders,
  exposedHeaders: ["Content-Disposition", "Content-Type"],
  optionsSuccessStatus: 204
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (matchesAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || defaultAllowedHeaders.join(", ")
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(
  "/uploads",
  express.static(uploadsRoot, {
    setHeaders(res, filePath) {
      const normalizedPath = String(filePath || "").toLowerCase();

      if (normalizedPath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    }
  })
);

// API routes
app.use("/api", routes);

// ✅ Serve the built frontend static files (JS, CSS, images, etc.)
app.use(express.static(frontendDistPath));

// ✅ Catch-all: for any non-API route, send index.html so React Router works
// This MUST come after all API routes and before the error handlers
app.get("*", (req, res, next) => {
  // Let the notFound middleware handle unknown /api routes
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use(notFound);
app.use(errorHandler);

export default app;
