# stimulus-web-components

This library lets you write Stimulus controllers that can also act as Web Components! So instead of writing:

```html
<div data-controller="my-widget" data-my-widget-hue="blue">
  <button data-action="my-widget#engage">Engage!</button>
  …
</div>
```

You can write:

```html
<stimulus-my-widget hue="blue">
  <button data-action="my-widget#engage">Engage!</button>
  …
</stimulus>
```

Stimulus Web Components supports element attributes and methods along with full support for the Shadow DOM!

_More docs to follow_
