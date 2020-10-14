**Code in this GIT repository wraps [axios](https://www.npmjs.com/package/axios) to add a proxy support.**

This code respects and uses environment variables:
- `http_proxy`
- `https_proxy`
- `no_proxy`

Supported also HTTPS connections over HTTP proxy and vice versa. For example, if you uses HTTPS connections over HTTP proxy, expected configuration format is:

```bash
https_proxy="http://you-proxy:port"
```

For proxy connection it is used a tunnelled proxy (command CONNECT). Used library [tunnel](https://www.npmjs.com/package/tunnel).

Usage
-----

```typescript
import axiosBehindProxy from './index';

const apiResponse = await axiosBehindProxy(/* parameters same as Axios */);

// Whole behavior is same as axios
```

Note
----

_This project and code is just example. Check and improve it before going to production. :-)_