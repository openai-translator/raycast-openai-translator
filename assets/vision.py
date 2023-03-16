import sys
import cv2
import json
import Quartz
import Vision
import subprocess
import urllib.parse
from Cocoa import NSURL, NSRange
from Foundation import NSDictionary, NSArray
from pathlib import Path



def ocr(img_path: Path, lang="zh_Hans"):
    input_url = NSURL.fileURLWithPath_(str(img_path))
    # with pipes() as (out, err):
    image = Quartz.CIImage.imageWithContentsOfURL_(input_url)
    # https://developer.apple.com/documentation/vision/vnimagerequesthandler?changes=latest_major&language=objc
    vision_handler = Vision.VNImageRequestHandler.alloc().initWithCIImage_options_(
        image, NSDictionary.dictionaryWithDictionary_({})
    )
    results = []

    def handler(request, error):
        if error:
            print(f"Error! {error}")
        else:
            # https://developer.apple.com/documentation/vision/vnobservation?changes=latest_major&language=objc
            observations = request.results()
            # https://developer.apple.com/documentation/vision/vnrecognizetextrequest?language=objc
            for text_observation in observations:
                # https://developer.apple.com/documentation/vision/vnrecognizedtext?language=objc
                recognized_text = text_observation.topCandidates_(1)[0]
                _str = recognized_text.string()
                box = recognized_text.boundingBoxForRange_error_(
                    NSRange(0, len(_str)), None
                )[0].boundingBox()

                # box = Vision.VNImageRectForNormalizedRect(box, image, )
                results.append([_str, recognized_text.confidence(), box])

    # https://developer.apple.com/documentation/vision/vnrequest/2875416-initwithcompletionhandler?changes=latest_major&language=objc
    vision_request = Vision.VNRecognizeTextRequest.alloc().initWithCompletionHandler_(
        handler
    )
    vision_request.setRecognitionLanguages_((lang,))
    error = vision_handler.performRequests_error_([vision_request], None)
    return results


def locating(img_path: Path, results) -> str:
    path = str(img_path)
    img = cv2.imread(path)
    h = img.shape[0]
    w = img.shape[1]
    for _, _, box in results:
        sp = (int(box.origin.x * w), h - int((box.origin.y + box.size.height) * h))
        ep = (
            int((box.size.width + box.origin.x) * w),
            h - int(box.origin.y * h),
        )
        img = cv2.rectangle(img, sp, ep, (255, 0, 0), 2)

    cv2.imwrite(path, img)
    return path

def text(results) -> str:
    return "\n".join(r[0] for r in results)

def main():
    mode = sys.argv[2]
    img_path = Path(sys.argv[1]).resolve()
    if not img_path.is_file():
        sys.exit("Invalid image path")
    results = ocr(img_path)
    if len(results) == 0:
        sys.exit("No Text Found")
    img = locating(img_path, results)
    context = {
        "txt" : text(results),
        "mode" : mode,
        "img" : img
    }
    subprocess.call(
    ["/usr/bin/open",
     f"raycast://extensions/douo/openai-translator/translate?context={urllib.parse.quote(json.dumps(context))}"
     ]
    )

if __name__ == "__main__":
    main()
