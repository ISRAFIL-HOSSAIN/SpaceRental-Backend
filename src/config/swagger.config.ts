import type { INestApplication } from "@nestjs/common";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";

const documentConfig = new DocumentBuilder()
  .setTitle("Space Rental API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const swaggerUiOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: "Space Rental API",
  customJs: [
    "https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js",
    "https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js",
  ],
  customCssUrl: ["https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"],
};

export const configureSwaggerUI = (app: INestApplication<any>) => {
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup("swagger", app, document, swaggerUiOptions);
};