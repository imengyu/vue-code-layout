# SplitN

Split grid component, which is the core functional implementation component of SplitLayout. Exported for standalone use.

## Props

| Property | Description | Type | Default |
| :----: | :----: | :----: | :----: |
| grids | Grid data | `CodeLayoutSplitNGrid[]` | — |
| horizontal | Is layout horizontal? | `boolean` | `true` |
| draggerSize | Set drag split line size (in pixels) | `number` | `1` |

## Slots

| Slot name | Description | Param |
| :----: | :----: | :----: |
| grid | Grid content rendering slot, grid is the current grid data | `{ grid }` |

## Example

[View example](../guide/split-layout.md#standalone-component)
