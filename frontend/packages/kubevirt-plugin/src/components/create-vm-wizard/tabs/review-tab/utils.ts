import { FormFieldType } from '../../form/form-field';
import { getBooleanReadableValue } from '../../../../utils/strings';
import { iGetFieldValue } from '../../selectors/immutable/field';
import { VMSettingsField } from '../../types';
import {iGet, iGetIn, toShallowJS} from '../../../../utils/immutable';
import { CUSTOM_FLAVOR } from '../../../../constants/vm';
import { iGetRelevantTemplate } from '../../../../selectors/immutable/template/combined';
import { VMTemplateWrapper } from '../../../../k8s/wrapper/vm/vm-template-wrapper';
import { Map as ImmutableMap } from 'immutable';
import { ITemplate } from '../../../../types/template';

export const getReviewValue = (field: any, fieldType: FormFieldType) => {
  const value = iGetFieldValue(field);

  return [FormFieldType.CHECKBOX, FormFieldType.INLINE_CHECKBOX].includes(fieldType)
    ? getBooleanReadableValue(value)
    : value;
};

export const getField = (key: VMSettingsField, vmSettings) => iGet(vmSettings, key);

export const getFieldValue = (vmSettings, key: VMSettingsField) => iGetIn(vmSettings, [key, 'value']);

export const getFlavorValue = ({
  iVMSettings,
  iUserTemplates,
  iCommonTemplates,
  relevantOptions,
}: GetFlavorValueParams) => {
  const flavor = getFieldValue(iVMSettings, VMSettingsField.FLAVOR);
  let cpuCores, memory;

  if (flavor === CUSTOM_FLAVOR) {
    cpuCores = getFieldValue(iVMSettings, VMSettingsField.CPU);
    memory = getFieldValue(iVMSettings, VMSettingsField.MEMORY);
  } else {
    const template_ = toShallowJS(
      iGetRelevantTemplate(iUserTemplates, iCommonTemplates, relevantOptions),
    );
    const template = new VMTemplateWrapper(template_, true).init().clearRuntimeMetadata();

    cpuCores = template.getCPU()?.cores;
    memory = template.getMemory();
  }

  return `${flavor}: ${cpuCores} CPU, ${memory}`;
};

type GetFlavorValueParams = {
  iVMSettings: any;
  iUserTemplates: ImmutableMap<string, ITemplate>;
  iCommonTemplates: ImmutableMap<string, ITemplate>;
  relevantOptions: any;
};
