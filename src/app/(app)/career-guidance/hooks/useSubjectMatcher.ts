'use client';

import { useMemo } from 'react';
import { PublicSubject } from '@/services/subjectService';
import { EnhancedSubject } from '../types';
import { subjectMapping } from '../data';

export function useSubjectMatcher(subjects: PublicSubject[]) {
  // Memoize the subject lookup function to make it stable across renders
  const getSubjectsByIds = useMemo(() => {
    // Return a function that maps IDs to enhanced subjects with topics
    return (subjectIds: string[]): EnhancedSubject[] => {
      // First try to match with actual subjects from the database
      return subjectIds.map((id) => {
        // Try different matching strategies in order of relevance
        // 1. Direct slug match
        // 2. ID contains slug or slug contains ID
        // 3. Name similarity with lowercasing and normalization
        // 4. Category match if available

        // Normalize strings for comparison - remove special chars, lowercase
        const normalizeString = (str: string) =>
          str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedId = normalizeString(id);

        // Find the best match among all subjects
        const matchedSubject = subjects.find((s) => {
          // Direct slug match
          if (s.slug === id) return true;

          // Partial slug match
          if (s.slug && (s.slug.includes(id) || id.includes(s.slug)))
            return true;

          // Normalized name match
          if (
            normalizeString(s.name).includes(normalizedId) ||
            normalizedId.includes(normalizeString(s.name))
          )
            return true;

          // Category match if available
          if (s.category && normalizeString(s.category).includes(normalizedId))
            return true;

          return false;
        });

        if (matchedSubject) {
          return {
            id: matchedSubject.id,
            name: matchedSubject.name,
            description: matchedSubject.description || '',
            slug: matchedSubject.slug || '',
            icon: matchedSubject.icon,
            category: matchedSubject.category,
            // Use topics from our mapping as they don't exist in the database
            topics: subjectMapping[id]?.topics || [],
          };
        }

        // If no match, use our fallback mapping
        return {
          id,
          name: subjectMapping[id]?.name || id,
          description: subjectMapping[id]?.description || '',
          slug: id,
          topics: subjectMapping[id]?.topics || [],
        };
      });
    };
  }, [subjects]);

  return { getSubjectsByIds };
}
