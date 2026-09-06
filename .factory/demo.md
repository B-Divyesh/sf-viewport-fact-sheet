# Viewport Fact Sheet demo

Open `/demo/` or choose **Try it with sample data** on the landing page. The page opens with a populated report for a checkout panel that is partly clipped and covered by a sticky footer.

The demo stores its sample report only in the `demo:vfs:workspace` localStorage key. It never reads or writes the separate real-state namespace (`vfs:real:*`). **Reset demo** discards and reseeds the demo key. **Start for real** discards the demo key before returning home.

The sample JSON has schema version `1.0`, a 37% visible area, a clipping ancestor, and an `occluded-at-visible-center` reason. It is available immediately and is cached with the demo shell after the first visit for the offline claim.
