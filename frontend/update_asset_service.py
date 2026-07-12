import re

with open('src/services/assetService.ts', 'r') as f:
    content = f.read()

# 1. Modify returnAsset signature and implementation
return_asset_regex = r'export async function returnAsset\(assetId: string\): Promise<void> \{(.*?)\s+await logActivity\("Return Asset", `Returned asset \$\{assetId\}`\);\n\}'
return_asset_replacement = '''export async function returnAsset(assetId: string, checkInNotes?: string, condition?: string): Promise<void> {\\1
      // If checkInNotes or condition provided, we could save them to the allocation record or asset history.
      // We will append to the return record or asset description for now since Asset doesn't have condition property explicitly, but types.ts has AssetCondition.
      if (checkInNotes) {
        transaction.update(assetRef, { description: assetData.description + "\\nCheck-in Notes: " + checkInNotes });
      }
    });

  await logActivity("Return Asset", `Returned asset ${assetId}`);
}'''
content = re.sub(return_asset_regex, return_asset_replacement, content, flags=re.DOTALL)

# Also update the part inside returnAsset where it updates the allocation doc:
alloc_update_regex = r'transaction\.update\(doc\.ref, \{\s*status: "Returned",\s*returnedAt: Date\.now\(\)\s*\}\);'
alloc_update_replacement = '''transaction.update(doc.ref, {
        status: "Returned",
        returnedAt: Date.now()
      });'''
content = re.sub(alloc_update_regex, alloc_update_replacement, content)

# 2. Add getAllocations
if 'export async function getAllocations' not in content:
    content += '''\n
export async function getAllocations(): Promise<Allocation[]> {
  const colRef = collection(db, "allocations");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as Allocation);
}
'''

with open('src/services/assetService.ts', 'w') as f:
    f.write(content)
