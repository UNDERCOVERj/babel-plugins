import type { NodePath } from '@babel/traverse';
import type { ImportDeclaration, JSXOpeningElement } from '@babel/types';
import {
  booleanLiteral,
  numericLiteral,
  stringLiteral,
  jsxExpressionContainer,
  jsxIdentifier,
  jsxAttribute,
  isImportSpecifier,
  isStringLiteral,
  isJSXIdentifier,
  isJSXSpreadAttribute,
} from '@babel/types';

export interface BabelPluginAppendKeyValueOption {
  options: {
    libraryName: string; // 包名
    appendKvArray: {
      componentName: string; // 组件名
      skipKeys?: string[]; // 如果有skipKeys其中的任意一个属性，则跳过添加
      kvsMap: Map<string, string | boolean | number>; // 需要添加的属性及值
    }[];
  }[];
}

// 为引用特定包的组件，添加默认参数
export function babelPluginJsxAppendKeyValue() {
  let targetToImportMap: Map<
    string,
    {
      importedName: string;
      sourceValue: string;
    }
  > = new Map();

  return {
    name: 'babel-plugin-jsx-append-key-value',
    pre() {
      targetToImportMap = new Map();
    },
    post() {
      targetToImportMap = new Map();
    },
    visitor: {
      ImportDeclaration(path: NodePath<ImportDeclaration>) {
        path.node.specifiers.forEach(item => {
          if (isImportSpecifier(item)) {
            // local name为重命名后的name
            targetToImportMap.set(item.local.name, {
              // 原始组件名
              importedName: isStringLiteral(item.imported)
                ? item.imported.value
                : item.imported.name,
              // 引入的path
              sourceValue: path.node.source.value,
            });
          }
        });
      },
      JSXOpeningElement(
        path: NodePath<JSXOpeningElement>,
        { opts: { options } }: { opts: BabelPluginAppendKeyValueOption },
      ) {
        if (!isJSXIdentifier(path.node.name)) return;

        const result = targetToImportMap.get(path.node.name.name);

        if (!result) return;

        // 匹配包名
        const findedOption = options.find(item => item.libraryName === result.sourceValue);

        findedOption?.appendKvArray.forEach(({ componentName, skipKeys, kvsMap }) => {
          // 引入的原始组件名为选项组件名
          if (componentName === result.importedName) {
            const { attributes } = path.node;
            if (
              !attributes.some(
                item =>
                  !isJSXSpreadAttribute(item) &&
                  isJSXIdentifier(item.name) &&
                  (skipKeys?.includes(item.name.name) || kvsMap.has(item.name.name)),
              )
            ) {
              kvsMap.forEach((value, key) => {
                let newAttr = null;
                if (typeof value === 'boolean') {
                  newAttr = jsxAttribute(
                    jsxIdentifier(key),
                    jsxExpressionContainer(booleanLiteral(value)),
                  );
                } else if (typeof value === 'string') {
                  newAttr = jsxAttribute(
                    jsxIdentifier(key),
                    jsxExpressionContainer(stringLiteral(value)),
                  );
                } else if (typeof value === 'number') {
                  newAttr = jsxAttribute(
                    jsxIdentifier(key),
                    jsxExpressionContainer(numericLiteral(value)),
                  );
                } else {
                  throw new Error('only support boolean、string、number');
                }
                attributes.unshift(newAttr);
              });
            }
          }
        });
      },
    },
  };
}
