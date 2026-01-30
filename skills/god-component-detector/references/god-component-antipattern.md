# God Component Anti-Pattern Reference

## Overview

The God Component (or God Object) anti-pattern occurs when a single component assumes too many responsibilities, violating the Single Responsibility Principle (SRP) from SOLID design principles.

## History

- **Origin**: Coined in the context of Object-Oriented Programming
- **Also Known As**: Blob, Winnebago, The Kitchen Sink
- **First Documented**: "AntiPatterns" book by William J. Brown et al. (1998)

## Characteristics

### Primary Indicators

1. **Size**: >300 lines of code (>500 is critical)
2. **Cohesion**: Low - handles unrelated functionality
3. **Coupling**: High - depends on many other modules
4. **Complexity**: High cyclomatic complexity

### Secondary Indicators

- Difficult to test
- Hard to reuse
- Changes ripple through the component
- Difficult to understand
- Multiple developers editing same file causes conflicts

## Why It's Bad

### Maintainability Issues

- Changes to one feature affect unrelated features
- Bug fixes risk breaking other functionality
- Difficult to understand what the component does

### Testing Challenges

- Hard to write unit tests
- Tests become integration tests
- Mocking becomes complex
- Test coverage is difficult

### Reusability Problems

- Component is too specific to reuse
- Cannot extract parts without the whole
- Tight coupling prevents composition

### Team Collaboration

- Merge conflicts frequent
- Multiple developers stepping on each other
- Code reviews become lengthy
- Knowledge silos form

## Real-World Example: E-commerce Product Page

### ❌ God Component (600 lines)

```tsx
"use client";

function ProductPage({ productId }) {
  // State explosion
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [infoTab, setInfoTab] = useState("description");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Multiple data fetching responsibilities
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    fetchRecommendations();
  }, [product]);

  useEffect(() => {
    loadCart();
  }, []);

  // Business logic
  const calculatePrice = () => {
    const basePrice = selectedVariant?.price || product.price;
    const discount = product.discount || 0;
    return basePrice * (1 - discount) * quantity;
  };

  const calculateShipping = () => {
    // Complex shipping calculation
  };

  const calculateTax = () => {
    // Tax calculation
  };

  // API calls
  async function fetchProduct() {
    // ...
  }

  async function fetchReviews() {
    // ...
  }

  async function fetchRecommendations() {
    // ...
  }

  // Cart operations
  async function addToCart() {
    // ...
  }

  async function updateCartQuantity() {
    // ...
  }

  // Wishlist operations
  async function addToWishlist() {
    // ...
  }

  // Review operations
  async function submitReview() {
    // Validation
    // API call
    // Update UI
  }

  // Form handling
  const handleReviewChange = (e) => {
    // ...
  };

  // Routing
  const router = useRouter();
  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Analytics
  useEffect(() => {
    trackPageView(productId);
  }, [productId]);

  const trackAddToCart = () => {
    // Analytics logic
  };

  // 300 more lines of JSX with nested conditionals...
  return <div>{/* Massive JSX tree */}</div>;
}
```

### ✅ Refactored Solution

```tsx
// hooks/useProduct.ts
export function useProduct(productId: string) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch logic
  }, [productId]);

  return { product, loading };
}

// hooks/useReviews.ts
export function useReviews(productId: string) {
  // Reviews logic
}

// hooks/useCart.ts
export function useCart() {
  // Cart logic with context
}

// services/pricing.ts
export class PricingService {
  static calculatePrice(product, variant, quantity) {
    // Business logic
  }

  static calculateShipping(product, address) {
    // Shipping logic
  }
}

// components/ProductPage/index.tsx
export function ProductPage({ productId }) {
  const { product } = useProduct(productId);
  const { reviews } = useReviews(productId);
  const { addToCart } = useCart();

  if (!product) return <ProductSkeleton />;

  return (
    <div>
      <ProductHeader product={product} />
      <ProductImages images={product.images} />
      <ProductInfo product={product} />
      <ProductPricing product={product} />
      <ProductActions onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
      <ProductTabs>
        <ProductDescription description={product.description} />
        <ProductReviews reviews={reviews} />
        <ProductSpecs specs={product.specs} />
      </ProductTabs>
      <ProductRecommendations productId={productId} />
    </div>
  );
}

// Each component <100 lines, single responsibility
```

## Refactoring Process

### Step 1: Analyze

- Identify all responsibilities
- Count metrics (LOC, hooks, functions)
- Map dependencies

### Step 2: Group

- Group related functionality
- Identify natural boundaries
- Look for reusable patterns

### Step 3: Extract

- Start with easiest extractions (utilities)
- Move to custom hooks
- Split UI components last

### Step 4: Test

- Ensure functionality unchanged
- Add tests for extracted pieces
- Verify integration

### Step 5: Iterate

- Continue splitting if needed
- Monitor metrics
- Get team feedback

## Prevention Strategies

### During Development

1. **Set LOC Limits**: Use linter to warn at 200 lines, error at 300
2. **Code Reviews**: Check for SRP violations
3. **Pair Programming**: Catch issues early
4. **Component Templates**: Start with good structure

### Architectural

1. **Feature Folders**: Co-locate related files
2. **Composition**: Build from small pieces
3. **Custom Hooks**: Extract logic early
4. **Service Layer**: Keep business logic separate

### Process

1. **Regular Refactoring**: Schedule time for cleanup
2. **Metrics Tracking**: Monitor component sizes
3. **Team Guidelines**: Document standards
4. **Automated Checks**: CI/CD checks for violations

## Tools

- **ESLint**: `eslint-plugin-react` - max-lines rule
- **SonarQube**: Complexity metrics
- **Code Climate**: Maintainability scores
- **Custom Scripts**: Like this skill's detector

## Further Reading

- "Clean Code" by Robert C. Martin
- "Refactoring" by Martin Fowler
- "AntiPatterns" by William J. Brown
- React Documentation: Thinking in React
- Kent C. Dodds: "AHA Programming"

## Related Anti-Patterns

- **God Object**: OOP equivalent
- **Big Ball of Mud**: Architecture level
- **Spaghetti Code**: Procedural equivalent
- **Lava Flow**: Dead code accumulation
