using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Backend.Data;
using Backend.Services;
using Backend.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Base de datos SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=vaquita.db"));

// 2. Inyección de Dependencias (Patrón Repository + Service)
builder.Services.AddScoped<IVaquitaRepository, VaquitaRepository>();
builder.Services.AddScoped<IVaquitaService, VaquitaService>();

// 3. Autenticación JWT
var jwtKey = builder.Configuration["JwtKey"] ?? "ClaveSecretaSuperSeguraDeAlMenos32Caracteres2026!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// 4. CORS para conectar con React (Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Swagger con soporte para botón "Authorize" (Bearer JWT - Swashbuckle 11 / .NET 10)
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        In = ParameterLocation.Header,
        Description = "Ingresá: Bearer {tu_token_jwt}"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

var app = builder.Build();

// Crear la base de datos SQLite automáticamente si no existe
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// 6. Pipeline de Middlewares
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("PermitirReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();