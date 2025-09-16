export { ContributionRegistry, contributionRegistry, ContributionRegistryOptions } from './contributionRegistry';
export { ContributionLoader } from './contributionLoader';
export { ContextEvaluator, contextEvaluator } from './contextEvaluator';
export { ContributionValidator, contributionValidator} from './contributionValidator'
export * from '../types';

import {ContributionRegistry, ContributionRegistryOptions} from "./contributionRegistry"
import {ContributionLoader, ContributionLoaderOptions} from "./contributionLoader"

// Utility functions
export function createContributionRegistry(options?: ContributionRegistryOptions) {
  return new ContributionRegistry(options);
}

export function createContributionLoader(
  registry: ContributionRegistry,
  options?: ContributionLoaderOptions
) {
  return new ContributionLoader(registry, options);
}