# D3 com Crossfilter, DC.js e Leaflet: Crimes Chicago

https://observablehq.com/@castelojb/d3-com-crossfilter-dc-js-e-leaflet-crimes-chicago@501

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
python -m SimpleHTTPServer
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/8d2491fada1601ea.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@castelojb/d3-com-crossfilter-dc-js-e-leaflet-crimes-chicago";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
