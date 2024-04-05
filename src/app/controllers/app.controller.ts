import { Request, Response, Router } from "express";
import { pino } from 'pino';
import { UserService } from "../services/user.service";

export class AppController {
  public router: Router = Router();
  private log: pino.Logger = pino();

  constructor(private userService: UserService) {
    this.initializeRouter();
  }

  private initializeRouter() {

    this.router.get("/login", function (req: any, res: any) {
      res.render("login");
    });

    this.router.post("/login", (req: any, res: Response) => {
      req.session.user = req.body.username;
      res.redirect("/");
    });

    this.router.get("/logout", function (req:any, res: any) {
      delete req.session.user;
      res.render("login");
    });

    this.router.get("/signup", function (req: any, res: any) {
      res.render("signup");
    });

    this.router.post("/signup", async (req: any, res: any) => {
      const user = await this.userService.createUser(req.body.username, req.body.email, req.body.password);
      req.session.user = user;
      res.redirect("/");
    }); 

    //handling login submissions
    this.router.post("/processLogin", async (req: any, res: any) => {
      const user = await this.userService.authenticateUser(req.body.username, req.body.password);
      if (user) {
        req.session.user = user;
        res.redirect("/");
      } else {
        res.status(401).send("Invalid username or password");
      }
    });

    //protect the homepage
    const enforceLogin = (req: any, res: Response, next: any) => {
      if(req.session.user) {
        next();
      } else {
        res.redirect("/login");
      }
    };

    //security middleware
    this.router.use(enforceLogin);

    // Serve the home page
    this.router.get("/",  (req: any, res: Response) => {
      try {
        // Render the "home" template as HTML
        res.render("home", {
        user: req.session.user
        });
      } catch (err) {
        this.log.error(err);
      }
    });
    
  }
}
