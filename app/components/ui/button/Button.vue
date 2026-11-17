<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'
import type { HTMLAttributes } from 'vue'
interface Props {
  as?: string
  asChild?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm'
  class?: HTMLAttributes['class']
}
const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})
const variants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: { default: 'min-h-11 px-4 py-2', sm: 'min-h-11 px-3' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
</script>
<template>
  <Primitive :as="as" :as-child="asChild" :class="cn(variants({ variant, size }), props.class)"
    ><slot
  /></Primitive>
</template>
