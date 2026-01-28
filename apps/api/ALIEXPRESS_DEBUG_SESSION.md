# Sesión de Debug: AliExpress API Signature Error

**Fecha:** 28 de Enero, 2026  
**Problema:** Error "IncompleteSignature" al intercambiar código OAuth por access token

---

## Contexto Inicial

El usuario reportó error en Postman al intentar intercambiar código de autorización OAuth:

```json
{
    "success": false,
    "error": "AliExpress token exchange failed: Token exchange failed: The request signature does not conform to platform standards",
    "message": "Failed to exchange code for token"
}
```

## Análisis de la Implementación Existente

### Problemas Identificados

1. **4 métodos diferentes de generación de firmas** - Conflicto entre implementaciones
2. **Algoritmo incorrecto para OAuth** - Usaba SHA256 simple en lugar de HMAC-SHA256
3. **Parámetro `format` inconsistente** - Incluido en algunos lugares pero no en otros
4. **Credenciales hardcodeadas** - En `aliexpress.service.ts`
5. **Confusión entre tipos de API** - OAuth vs Business APIs

### Implementación Original (Incorrecta)

```typescript
// ❌ INCORRECTO - SHA256 simple con formato sandwich
private generateRestSignature(params: Record<string, any>): string {
    const fullSignString = this.appSecret + signString + this.appSecret;
    const signature = crypto
        .createHash('sha256')  // ❌ Hash simple, no HMAC
        .update(fullSignString, 'utf8')
        .digest('hex')
        .toUpperCase();
    return signature;
}
```

---

## Refactorización Inicial

### Cambio 1: Unificar Método de Firma (Primer Intento)

Basado en documentación oficial de Alibaba (docId: 120322):

```typescript
/**
 * Generate signature using official AliExpress algorithm (HMAC-SHA256)
 * Algorithm: apiPath + key1value1key2value2...
 */
private generateSignature(params: Record<string, any>, apiPath: string): string {
    const sortedKeys = Object.keys(params)
        .filter(key => key !== 'sign')
        .sort();

    let concatenated = '';
    sortedKeys.forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            concatenated += key + params[key];
        }
    });

    const stringToSign = apiPath + concatenated;

    const signature = crypto
        .createHmac('sha256', this.appSecret)
        .update(stringToSign, 'utf8')
        .digest('hex')
        .toUpperCase();

    return signature;
}
```

**Resultado:** ❌ Aún error "IncompleteSignature"

### Logs del Primer Intento

```
🔍 Token Exchange Request:
  Timestamp: 1769578817489
  Code: 3_525634_ODI83RIV08fluuU22ZUouCzo2180

🔐 Signature Generation:
  API Path: /auth/token/create
  Sorted Keys: [ 'app_key', 'code', 'sign_method', 'timestamp' ]
  String to Sign: /auth/token/createapp_key525634code3_525634_ODI83RIV08fluuU22ZUouCzo2180sign_methodsha256timestamp1769578817489
  String Length: 111
  Generated Signature: 361AAFE8F2FDE95454845BE0E78C4F27B03B5A4F1B270C086DA0F55A352D6328
```

**Respuesta de AliExpress:**
```json
{
  "type": "ISV",
  "code": "IncompleteSignature",
  "message": "The request signature does not conform to platform standards",
  "request_id": "214133ad17695788186245854"
}
```

---

## Cambio 2: Content-Type

Cambié de `application/json` a `application/x-www-form-urlencoded`:

```typescript
const response = await this.httpClient.post('/rest' + apiPath, 
    new URLSearchParams(requestBody as any).toString(), 
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }
);
```

**Resultado:** ❌ Mismo error

---

## Cambio 3: Algoritmo OAuth Separado (Corrección Final)

### Descubrimiento Clave

Los endpoints de OAuth usan un algoritmo **diferente** al de Business APIs:

| Tipo de API | StringToSign Format |
|-------------|---------------------|
| **OAuth** (`/auth/token/create`) | `appSecret + key1value1... + appSecret` |
| **Business APIs** (`/sync`) | `apiPath + key1value1...` |

### Implementación Corregida

```typescript
/**
 * Generate signature for OAuth endpoints (token/refresh)
 * OAuth endpoints use: appSecret + key1value1key2value2... + appSecret
 * NO apiPath prepended for OAuth
 */
private generateOAuthSignature(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params)
        .filter(key => key !== 'sign')
        .sort();

    let concatenated = '';
    sortedKeys.forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            concatenated += key + params[key];
        }
    });

    // OAuth format: appSecret + concatenated + appSecret
    const stringToSign = this.appSecret + concatenated + this.appSecret;

    console.log('🔐 OAuth Signature Generation:');
    console.log('  Sorted Keys:', sortedKeys);
    console.log('  String to Sign (first 50 chars):', stringToSign.substring(0, 50) + '...');
    console.log('  String to Sign (last 30 chars):', '...' + stringToSign.substring(stringToSign.length - 30));
    console.log('  String Length:', stringToSign.length);

    const signature = crypto
        .createHmac('sha256', this.appSecret)
        .update(stringToSign, 'utf8')
        .digest('hex')
        .toUpperCase();

    console.log('  Generated Signature:', signature);

    return signature;
}
```

### Uso en getAccessToken

```typescript
async getAccessToken(code: string): Promise<{...}> {
    const apiPath = '/auth/token/create';
    const timestamp = Date.now().toString();

    const params = {
        app_key: this.appKey,
        sign_method: 'sha256',
        timestamp,
        code,
    };

    // Generate signature WITHOUT apiPath for OAuth endpoints
    const sign = this.generateOAuthSignature(params);

    const requestBody = { ...params, sign };

    const response = await this.httpClient.post('/rest' + apiPath, 
        new URLSearchParams(requestBody as any).toString(), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
    );

    return response.data;
}
```

**Estado:** ⏳ Pendiente de prueba (servidor necesita reiniciarse)

---

## Archivos Modificados

### 1. `aliexpress-api.client.ts`

**Cambios:**
- ✅ Agregado `generateOAuthSignature()` para OAuth endpoints
- ✅ Mantenido `generateSignature()` para Business APIs
- ✅ Actualizado `getAccessToken()` para usar OAuth signature
- ✅ Actualizado `refreshAccessToken()` para usar OAuth signature
- ✅ Cambiado Content-Type a `application/x-www-form-urlencoded`
- ✅ Agregada validación de respuesta (`code !== '0'`)
- ✅ Mejorado manejo de errores con tipos

### 2. `aliexpress.service.ts`

**Cambios:**
- ✅ Removido método `generateSignature()` duplicado
- ✅ Removido método `prepareTokenRequestParams()` con credenciales hardcodeadas
- ✅ Removido import de `crypto` (no usado)
- ✅ Delegación completa al API client

### 3. `aliexpress.controller.ts`

**Cambios:**
- ✅ Removido endpoint `/generate-token-signature` obsoleto

---

## Comparación de Algoritmos

### Algoritmo INCORRECTO (Original)

```typescript
// ❌ SHA256 simple
const fullSignString = appSecret + signString + appSecret;
const signature = crypto.createHash('sha256').update(fullSignString).digest('hex').toUpperCase();
```

### Algoritmo INCORRECTO (Primer Intento)

```typescript
// ❌ HMAC-SHA256 pero con apiPath para OAuth
const stringToSign = apiPath + concatenated;  // ❌ apiPath no debe estar para OAuth
const signature = crypto.createHmac('sha256', appSecret).update(stringToSign).digest('hex').toUpperCase();
```

### Algoritmo CORRECTO (OAuth)

```typescript
// ✅ HMAC-SHA256 con formato sandwich, SIN apiPath
const stringToSign = appSecret + concatenated + appSecret;
const signature = crypto.createHmac('sha256', appSecret).update(stringToSign).digest('hex').toUpperCase();
```

### Algoritmo CORRECTO (Business APIs)

```typescript
// ✅ HMAC-SHA256 con apiPath prepended
const stringToSign = apiPath + concatenated;
const signature = crypto.createHmac('sha256', appSecret).update(stringToSign).digest('hex').toUpperCase();
```

---

## Ejemplo de StringToSign

### Para OAuth Token Exchange

**Parámetros:**
```typescript
{
  app_key: "525634",
  code: "3_525634_ODI83RIV08fluuU22ZUouCzo2180",
  sign_method: "sha256",
  timestamp: "1769578817489"
}
```

**StringToSign INCORRECTO (con apiPath):**
```
/auth/token/createapp_key525634code3_525634_ODI83RIV08fluuU22ZUouCzo2180sign_methodsha256timestamp1769578817489
```

**StringToSign CORRECTO (sin apiPath):**
```
1RM7SSSS5FKeDV7qJqxc3Y6HGeE8Kr1bapp_key525634code3_525634_ODI83RIV08fluuU22ZUouCzo2180sign_methodsha256timestamp17695788174891RM7SSSS5FKeDV7qJqxc3Y6HGeE8Kr1b
```

Formato: `appSecret + key1value1key2value2... + appSecret`

---

## Próximos Pasos

### Pendiente de Verificación

1. ⏳ **Reiniciar servidor** - Los cambios no se han aplicado aún
2. ⏳ **Probar con nuevo código** - El código actual puede estar expirado
3. ⏳ **Verificar logs nuevos** - Deberían mostrar OAuth signature format

### Si Aún Falla

Posibles causas adicionales:

1. **Código expirado** - Los códigos OAuth expiran en 30 minutos
2. **Código ya usado** - Solo se puede usar una vez
3. **App Key/Secret incorrectos** - Verificar credenciales en AliExpress console
4. **Permisos de API** - Verificar que la app tenga permisos de Dropshipper
5. **Región incorrecta** - Verificar que se use el gateway correcto (SG, RU, EU)

### Comandos de Testing

```bash
# 1. Obtener nuevo código de autorización
# Abrir en navegador:
https://api-sg.aliexpress.com/oauth/authorize?response_type=code&client_id=525634&redirect_uri=CALLBACK_URL&force_auth=true

# 2. Probar en Postman
POST http://localhost:4000/api/aliexpress/exchange-token
Content-Type: application/json

{
  "code": "3_525634_NUEVO_CODIGO"
}
```

---

## Referencias

### Documentación Oficial
- **Alibaba Signature Algorithm:** docId: 120322
- **AliExpress Open Platform:** https://openservice.aliexpress.com
- **Seller Authorization Guide:** https://developer.alibaba.com/docs/doc.htm?treeId=727&articleId=120687

### Informe Técnico Proporcionado
- Confirma uso de HMAC-SHA256
- Menciona formato `apiPath + params` pero para Business APIs
- OAuth endpoints usan formato diferente (sandwich)

### SDKs de Referencia
- **ae_sdk (Node.js):** https://github.com/moh3a/ae_sdk
- **ae-api (Node.js):** https://github.com/umpordez/ae-api

---

## Resumen de Lecciones Aprendidas

1. **OAuth vs Business APIs tienen algoritmos diferentes**
   - OAuth: `appSecret + params + appSecret`
   - Business: `apiPath + params`

2. **Content-Type importa**
   - OAuth endpoints prefieren `application/x-www-form-urlencoded`
   - Algunos endpoints aceptan `application/json`

3. **Documentación confusa**
   - AliExpress mezcla plataforma antigua (Taobao) con nueva
   - Diferentes tipos de APIs (Seller, Dropshipper, Affiliate) tienen requisitos diferentes

4. **Logs detallados son cruciales**
   - Mostrar stringToSign completo ayuda a debuggear
   - Comparar con ejemplos conocidos

5. **Códigos OAuth expiran rápido**
   - 30 minutos de vida
   - Solo se pueden usar una vez
   - Necesitas obtener uno nuevo para cada prueba

---

**Estado Final:** Implementación corregida, pendiente de prueba con servidor reiniciado y código OAuth fresco.
