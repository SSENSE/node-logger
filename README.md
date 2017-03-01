# Node Logger

[![Build Status](https://travis-ci.org/SSENSE/node-logger.svg?branch=develop)](https://travis-ci.org/SSENSE/node-logger)
[![Coverage Status](https://coveralls.io/repos/github/SSENSE/node-logger/badge.svg?branch=develop)](https://coveralls.io/github/SSENSE/node-logger?branch=develop)
[![Latest Stable Version](https://img.shields.io/npm/v/@ssense/node-logger.svg)](https://www.npmjs.com/package/@ssense/node-logger)

SSENSE Standardized Logs


## Application Logger

```javascript
// Inclusion
import {Logger, LogLevel} from '@ssense/node-logger';
```
```javascript
// Usage
const logger = new AppLogger('your_app_id', LogLevel.Silly);
// Enable / Disable
logger.enable(true);
// Set log level
logger.setLevel('Silly');
// Prettify / Indent
logger.makePretty(true);

// Log
// silly(message: string, id?: string, tags?: string[], details?: any)
// verbose(message: string, id?: string, tags?: string[], details?: any)
// info(message: string, id?: string, tags?: string[], details?: any)
// warn(message: string, id?: string, tags?: string[], details?: any)
// error(message: string, id?: string, tags?: string[], details?: any)
logger.silly('Some log message');
logger.error(`Error with paypal express checkout: ${orderId}`, 'MY_REQUEST_ID', ['checkout', 'paypal'], error.stack);
```

## Request Logger

```js
req.logger = logger.getRequestLogger('MY_REQUEST_ID');
req.logger.error(`Error with paypal express checkout: ${orderId}`, ['checkout', 'paypal'], error.stack);
```

## Access logger

```javascript
import {AccessLogger} from '@ssense/node-logger';
```

```javascript
const accessLogger = new AccessLogger('your_app_id');
// Enable / Disable
accessLogger.enable(true);
// Prettify / Indent
accessLogger.makePretty(process.env.NODE_ENV === 'development');

// Log
// logRequest(req: Request, res: Response)
accessLogger.logRequest(req, res);
```
