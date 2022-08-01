import { babelPluginJsxAppendKeyValue } from './babel-plugin-jsx-append-key-value';
import * as babel from '@babel/core';

describe('babelPluginJsxAppendKeyValue', () => {
  it('should work', () => {
    const result = babel.transform('code;', {
      plugins: [babelPluginJsxAppendKeyValue],
    });
    expect(result?.code).toEqual('code;');
  });

  it('should return appended syntax', () => {
    const result = babel.transform(
      `
      import React from 'react';
      import { Button, Switch } from 'antd';

      export function Test() {
        return <div>
          <Button />
          <Button type='primary' />
          <Switch />
        </div>
      }
    `,
      {
        plugins: [
          [
            babelPluginJsxAppendKeyValue,
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
                      kvsMap: new Map([['checked', true]]),
                    },
                  ],
                },
              ],
            },
          ],
        ],
        presets: ['@babel/preset-react'],
      },
    );
    expect(result?.code?.replace(/\s/g, '')).toMatch(
      `
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
    `.replace(/\s/g, ''),
    );
  });
});
