import type { HomeTemplate } from './types'
import { templateBatch01 } from './batches/batch01'
import { templateBatch02 } from './batches/batch02'
import { templateBatch03 } from './batches/batch03'
import { templateBatch04 } from './batches/batch04'
import { templateBatch05 } from './batches/batch05'
import { templateBatch06 } from './batches/batch06'
import { templateBatch07 } from './batches/batch07'
import { templateBatch08 } from './batches/batch08'
import { templateBatch09 } from './batches/batch09'
import { templateBatch10 } from './batches/batch10'
import { templateBatch11 } from './batches/batch11'
import { templateBatch12 } from './batches/batch12'
import { templateBatch13 } from './batches/batch13'
import { templateBatch14 } from './batches/batch14'
import { templateBatch15 } from './batches/batch15'
import { templateBatch16 } from './batches/batch16'
import { templateBatch17 } from './batches/batch17'
import { templateBatch18 } from './batches/batch18'
import { templateBatch19 } from './batches/batch19'
import { templateBatch20 } from './batches/batch20'

export const homeTemplateBatches: HomeTemplate[][] = [
  templateBatch01,
  templateBatch02,
  templateBatch03,
  templateBatch04,
  templateBatch05,
  templateBatch06,
  templateBatch07,
  templateBatch08,
  templateBatch09,
  templateBatch10,
  templateBatch11,
  templateBatch12,
  templateBatch13,
  templateBatch14,
  templateBatch15,
  templateBatch16,
  templateBatch17,
  templateBatch18,
  templateBatch19,
  templateBatch20,
]

export const homeTemplates: HomeTemplate[] = homeTemplateBatches.flat()

export {
  directionFilterOptions,
  scopeFilterOptions,
  typeFilterOptions,
} from './types'

export type {
  DirectionFilterValue,
  HomeTemplate,
  HomeTemplateFilters,
  HomeTemplateTone,
  ScopeFilterValue,
  TemplateCardIcon,
  TemplateDirectionTag,
  TemplateFilterOption,
  TemplatePage,
  TemplateScopeTag,
  TemplateTypeTag,
  TypeFilterValue,
} from './types'

export {
  filterTemplates,
  getFilteredTemplates,
  getTemplatePage,
  searchTemplates,
  sortTemplates,
} from './filtering'
