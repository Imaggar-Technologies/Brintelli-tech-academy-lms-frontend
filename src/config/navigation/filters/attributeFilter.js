/**
 * ABAC Filter - Attribute-Based Navigation Filtering
 * Filters navigation items based on user attributes (e.g., assignedClasses, enrolledCourses)
 */

/**
 * Recursively filters navigation items by attributes
 * @param {Array} nav - Navigation items array
 * @param {Object} userAttributes - Object containing user attributes
 * @returns {Array} Filtered navigation items
 */
export function filterByAttributes(nav, userAttributes = {}) {
  if (!nav || !Array.isArray(nav)) {
    return [];
  }

  return nav
    .map((item) => {
      // If item has children, recursively filter them
      if (item.children && Array.isArray(item.children)) {
        const filteredChildren = filterByAttributes(item.children, userAttributes);
        
        // If no children remain after filtering, remove the parent item
        if (filteredChildren.length === 0) {
          return null;
        }
        
        // Return item with filtered children
        return { ...item, children: filteredChildren };
      }

      // If item has no attribute requirements, show it
      if (!item.attributes || !Array.isArray(item.attributes) || item.attributes.length === 0) {
        return item;
      }

      // Check if ALL required attributes exist and have values (AND logic)
      const hasAllAttributes = item.attributes.every((attr) => {
        const attributeValue = userAttributes[attr];
        
        // Check if attribute exists and has length > 0 (for arrays)
        if (Array.isArray(attributeValue)) {
          return attributeValue.length > 0;
        }
        
        // Check if attribute exists and is truthy (for other types)
        return attributeValue !== null && attributeValue !== undefined && attributeValue !== "";
      });

      return hasAllAttributes ? item : null;
    })
    .filter(Boolean); // Remove null items
}

/**
 * Examples of userAttributes:
 * 
 * For Tutor:
 * {
 *   assignedClasses: ["class-1", "class-2"]
 * }
 * 
 * For Student:
 * {
 *   enrolledCourses: ["course-1", "course-2"]
 * }
 * 
 * For Sales Agent:
 * {
 *   assignedLeads: ["lead-1", "lead-2"]
 * }
 */

