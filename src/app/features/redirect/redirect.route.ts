import type { Elysia } from "elysia";
import { join } from "path";

export class RedirectRoutes {
  private app: Elysia;

  constructor(app: Elysia) {
    this.app = app;
  }

  public register(): void {
    this.app.group("/redirect", (group) =>
      group
        .get("/auth/reset-password", async (ctx) => {
          const token = ctx.query.token;

          if (!token) return new Response("Missing token", { status: 400 });

          const deepLink = Bun.env.RESET_PASSWORD_MOBILE_URL! + token;

          try {
            const templatePath = join(
              import.meta.dir,
              "templates/redirect.html",
            );

            const template = await Bun.file(templatePath).text();

            const html = template.replaceAll("{{DEEP_LINK}}", deepLink);

            return new Response(html, {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
              },
            });
          } catch (error) {
            return new Response("Not found", {
              status: 500,
            });
          }
        })
        .get("auth/verify-email", async (ctx) => {
          const token = ctx.query.token;

          if (!token) return new Response("Missing token", { status: 400 });

          const deepLink = Bun.env.VERIFY_EMAIL_MOBILE_URL! + token;

          try {
            const templatePath = join(
              import.meta.dir,
              "templates/redirect.html",
            );

            const template = await Bun.file(templatePath).text();

            const html = template.replaceAll("{{DEEP_LINK}}", deepLink);

            return new Response(html, {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
              },
            });
          } catch (error) {
            return new Response("Not found", {
              status: 500,
            });
          }
        }),
    );
  }
}
