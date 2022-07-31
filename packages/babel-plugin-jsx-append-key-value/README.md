# babel-plugin-jsx-append-key-value

A Babel plugin to append key value to specific react component from another library.

## Usage

1. install

```
npm i babel-plugin-jsx-append-key-value -D

yarn add babel-plugin-jsx-append-key-value -D

pnpm i babel-plugin-jsx-append-key-value -D
```

2. Add to your .babelrc:

```
{
  plugins: [
    [
      'babel-plugin-jsx-append-key-value',
      {
        options: [
          {
            libraryName: 'antd',
            appendKvArray: [
              {
                componentName: 'Button',
                skipKeys: ['type', 'plain'],
                kvsMap: new Map([['plain', false]]),
              },
              {
                componentName: 'Switch',
                kvsMap: new Map([['checked', true]])
              }
            ],
          },
        ],
      }
    ]
  ],
}
```

## Example

- Before

```
import React from 'react';
import { Button, Switch } from 'antd';

export function Test() {
  return <div>
    <Button />
    <Button type='primary' />
    <Switch />
  </div>
}
```

- After

```
import React from 'react';
import { Button, Switch } from 'antd';
export function Test() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    plain: false
  }), /*#__PURE__*/React.createElement(Button, {
    type: "primary"
  }), /*#__PURE__*/React.createElement(Switch, {
    checked: true
  }));
}
```
