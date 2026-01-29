# Follow-up Questions: Post-Coding Discussion

> **Mục đích**: Chuẩn bị cho phần discussion sau khi coding xong
> **Format phỏng vấn**: Coding → Discuss solution → Follow-up questions
> **Quan trọng**: Đây là phần đánh giá Senior-level thinking

---

## 🎯 Các loại Follow-up Questions

1. **Design choices** - Tại sao chọn approach này?
2. **Scalability** - Nếu scale lên thì sao?
3. **Edge cases** - Đã handle các case đặc biệt chưa?
4. **Testing** - Test như thế nào?
5. **Improvement** - Cải thiện gì nếu có thêm thời gian?
6. **Real-world** - Trong production thì làm khác gì?

---

# CATEGORY 1: DESIGN CHOICES

## Q: "Why did you choose this approach?"

### Template trả lời:
```
"I chose this approach because [reason 1], [reason 2].

The alternatives I considered were [alternative 1] and [alternative 2].

I went with my approach because [trade-off explanation].

In a real project, I might also consider [additional context]."
```

### Ví dụ cụ thể:

**Q: Why did you use useState instead of useReducer?**
```
"I used useState because the state was relatively simple - just a few
independent values. useReducer would be better if:
- State transitions were complex
- Multiple values needed to update together
- I wanted to extract the logic for testing

For this exercise, useState kept the code readable without over-engineering."
```

**Q: Why did you create a custom hook?**
```
"I extracted the hook because:
1. It separates concerns - UI component vs logic
2. Makes the logic testable in isolation
3. Could be reused if another component needs similar behavior

The trade-off is slightly more files, but the separation is worth it
for maintainability."
```

**Q: Why fetch in useEffect instead of React Query?**
```
"For this exercise, I used useEffect to keep it simple and show
understanding of fundamentals.

In production, I would use React Query because:
- Built-in caching and deduplication
- Automatic refetching and background updates
- Optimistic updates
- Better loading/error state management

React Query would reduce the boilerplate I wrote here by about 70%."
```

---

# CATEGORY 2: SCALABILITY

## Q: "What if we had 10,000 items instead of 100?"

### Pagination
```
"With 10,000 items, I would implement pagination or infinite scroll:

1. **Server-side pagination**: Fetch 20-50 items per page
2. **Cursor-based**: Better than offset for real-time data
3. **API**: GET /items?cursor=abc&limit=20

For the UI, I'd add:
- Page numbers or 'Load more' button
- Skeleton loading for new pages
- Keep previous pages in memory for smooth back-navigation"
```

### Virtualization
```
"If we need to display all 10,000 items without pagination:

1. Use virtualization with react-window or react-virtual
2. Only render visible items (typically 10-20 in viewport)
3. Recycle DOM nodes as user scrolls

This keeps DOM size constant regardless of data size."
```

### Filtering large datasets
```
"For filtering 10,000+ items:

1. Move filtering to server-side
2. Add debounce to search input (300-500ms)
3. Show loading indicator during search
4. Consider search indexes on backend for performance

Client-side filtering is only appropriate for <1000 items."
```

---

# CATEGORY 3: EDGE CASES

## Q: "What edge cases did you consider?"

### Checklist to mention:
```
□ Empty state - no data
□ Loading state - data fetching
□ Error state - API failure
□ Single item - only 1 result
□ Many items - pagination/virtualization
□ Long text - truncation, wrapping
□ Special characters - XSS, encoding
□ Rapid user input - debounce, race conditions
□ Network issues - offline, slow connection
□ Concurrent updates - optimistic UI, conflicts
```

### Ví dụ trả lời:
```
"I handled these edge cases:
1. Empty state - showed 'No results found' message
2. Loading - showed skeleton/spinner
3. Error - displayed error message with retry button

Edge cases I would add with more time:
4. Very long text - add text truncation with 'Show more'
5. Offline detection - show banner when network is down
6. Race conditions - cancel pending requests when new search starts"
```

---

# CATEGORY 4: ERROR HANDLING

## Q: "How would you handle errors from the API?"

```
"I would implement multiple layers of error handling:

1. **API client level**: Centralized error processing
   - Transform API errors to consistent format
   - Handle 401 → redirect to login
   - Handle 429 → implement retry with backoff

2. **Component level**: Show user-friendly messages
   - Display error state with retry button
   - Log errors to monitoring (Sentry)

3. **Global level**: Error boundary for unexpected errors
   - Catch rendering errors
   - Show fallback UI
   - Allow user to recover or report

For this specific component, I'd also:
- Distinguish between 'no results' and 'search failed'
- Show inline error near the input for validation errors
- Preserve user's input so they can retry without retyping"
```

## Q: "What if the API is slow?"

```
"For slow APIs, I would:

1. **Optimistic UI**: Update immediately, reconcile later
2. **Skeleton loading**: Better perceived performance
3. **Background refresh**: Stale-while-revalidate pattern
4. **Timeouts**: Set reasonable limits, show warning if exceeded
5. **Progressive loading**: Load critical data first, details later

In React Query terms:
- staleTime: 30 seconds (use cache while fresh)
- cacheTime: 5 minutes (keep in memory for quick nav)
- refetchOnWindowFocus: true (refresh when user returns)"
```

---

# CATEGORY 5: TESTING

## Q: "How would you test this component?"

```
"I would write tests at multiple levels:

**Unit tests:**
- Custom hooks in isolation (useDebounce, useSearch)
- Utility functions (formatDate, validateInput)

**Integration tests (RTL + MSW):**
- Render component
- Simulate user typing → verify debounce behavior
- Mock API response → verify results display
- Test error state → verify error message shows
- Test empty state → verify 'no results' message

**E2E tests (Playwright):**
- Full search flow: type → wait → see results
- Error recovery: API fails → retry → success

Example integration test:
```tsx
it('shows results after debounced search', async () => {
  render(<SearchComponent />);

  // Mock API
  server.use(
    rest.get('/api/search', (req, res, ctx) => {
      return res(ctx.json({ results: [{ id: '1', name: 'Test' }] }));
    })
  );

  // Type search term
  await userEvent.type(screen.getByRole('searchbox'), 'test');

  // Wait for debounce + API call
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```
```

---

# CATEGORY 6: IMPROVEMENT

## Q: "What would you improve with more time?"

### Template:
```
"If I had more time, I would:

1. [Improvement 1] - because [reason]
2. [Improvement 2] - because [reason]
3. [Improvement 3] - because [reason]

I prioritized [what you did] because [reason] for this exercise."
```

### Ví dụ cụ thể:
```
"With more time, I would improve:

1. **Accessibility**:
   - Add ARIA live regions for search results
   - Ensure keyboard navigation works fully
   - Test with screen reader

2. **Performance**:
   - Memoize expensive computations
   - Add virtualization if list grows
   - Implement request cancellation

3. **UX enhancements**:
   - Add search history/recent searches
   - Highlight matching text in results
   - Add keyboard shortcuts (Cmd+K to focus)

4. **Testing**:
   - Add integration tests with MSW
   - Test error recovery flows
   - Add accessibility tests with axe

I focused on core functionality first to demonstrate the main pattern."
```

---

# CATEGORY 7: REAL-WORLD CONSIDERATIONS

## Q: "In production, what would you do differently?"

```
"In a production environment, I would add:

**Data fetching:**
- Use React Query for caching, refetching, and state management
- Implement request deduplication
- Add retry logic with exponential backoff

**Performance:**
- Code splitting for this component if it's heavy
- Lazy load search results below the fold
- Optimize bundle size (check what I'm importing)

**Monitoring:**
- Track search queries and response times
- Monitor error rates
- Add analytics for user behavior

**Reliability:**
- Add circuit breaker for failing endpoints
- Implement graceful degradation
- Consider offline support if needed

**Security:**
- Sanitize search input
- Rate limit on API side
- Don't expose sensitive data in responses"
```

## Q: "How would you handle real-time updates?"

```
"For real-time updates, I would consider:

1. **Polling** (simplest):
   - Refresh every N seconds
   - Good for low-frequency updates

2. **Server-Sent Events (SSE)**:
   - One-way server → client
   - Good for notifications, feeds

3. **WebSocket**:
   - Bi-directional, lowest latency
   - Good for chat, live data

4. **Implementation details**:
   - Connection management (reconnect on failure)
   - Merge updates with existing cache
   - Optimistic UI for user actions
   - Fallback to polling if WebSocket fails

For search results specifically, I'd probably use polling or
invalidate cache on relevant mutations rather than real-time."
```

---

# QUICK REFERENCE: Common Follow-ups by Topic

## Debouncing
- "Why 300ms specifically?"
- "What if user presses Enter - should it search immediately?"
- "How would you handle the case where debounce is still waiting but user clicks submit?"

## State Management
- "Why not use a state management library?"
- "Where would this state live in a larger app?"
- "How would you share this state with other components?"

## TypeScript
- "How would you make this more type-safe?"
- "What utility types would be useful here?"
- "How would you type the API response?"

## Performance
- "What's the time complexity of this solution?"
- "Where are the potential performance bottlenecks?"
- "How would you profile this component?"

## Accessibility
- "How would a screen reader user interact with this?"
- "What ARIA attributes are missing?"
- "How would you test accessibility?"

---

# Practice Exercise

Sau khi làm mỗi bài CodeSandbox, tự hỏi và trả lời:

```
1. Why did I choose this approach?
2. What would I do with 10x more data?
3. What edge cases did I handle? What's missing?
4. How would I test this?
5. What would I improve with more time?
6. What would be different in production?
```

---

## Checklist

```
□ Review all question categories
□ Practice answering out loud in English
□ Time yourself - aim for 30-60 second answers
□ Practice with specific examples from your coding exercise
□ Have 2-3 improvements ready to mention
□ Know trade-offs of your decisions
```

---

**Key mindset**: Follow-up questions are about showing **Senior-level thinking**:
- Consider trade-offs
- Think about scale
- Know when to keep it simple vs when to optimize
- Be honest about limitations
- Show production awareness

**Good luck! 💪**
